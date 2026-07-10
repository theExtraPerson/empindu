from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils.dateparse import parse_date
from types import SimpleNamespace

from apps.gifting.models import GiftDetails
from apps.heritage.models import HeritageFundEntry
from apps.notifications.tasks import queue_order_notification
from apps.orders.models import Order, ReturnRequest
from apps.products.models import Product


VALID_STATUS_TRANSITIONS = {
    "pending_payment": {"paid", "refunded"},
    "paid": {"confirmed", "refunded"},
    "confirmed": {"dispatched", "refunded"},
    "dispatched": {"in_transit", "delivered"},
    "in_transit": {"delivered"},
    "delivered": {"disputed"},
    "disputed": {"refunded"},
    "refunded": set(),
}


def _create_gift_details(gift_payload) -> GiftDetails:
    scheduled_date = (
        parse_date(gift_payload.scheduled_delivery_date)
        if gift_payload.scheduled_delivery_date
        else None
    )
    return GiftDetails.objects.create(
        recipient_name=gift_payload.recipient_name,
        recipient_relationship=gift_payload.recipient_relationship,
        occasion=gift_payload.occasion,
        personal_message=gift_payload.personal_message,
        gift_wrap=gift_payload.gift_wrap,
        scheduled_delivery_date=scheduled_date,
    )


@transaction.atomic
def create_order_from_payload(payload, buyer=None) -> Order:
    product = (
        Product.objects.select_for_update()
        .select_related("artisan")
        .get(pk=payload.product_id, status="active")
    )
    if payload.quantity < 1:
        raise ValueError("Quantity must be at least 1.")
    if product.stock < payload.quantity:
        raise ValueError("Insufficient stock for this product.")

    gift_details = _create_gift_details(payload.gift_details) if payload.gift_details else None

    order = Order(
        product=product,
        buyer=buyer,
        artisan=product.artisan,
        is_gift=gift_details is not None,
        gift_details=gift_details,
        quantity=payload.quantity,
        payment_method=payload.payment_method,
        shipping_name=payload.shipping_name,
        buyer_email=payload.buyer_email,
        buyer_phone=payload.buyer_phone,
        shipping_country=payload.shipping_country,
        shipping_address=payload.shipping_address.dict(),
    )
    order.calculate_totals()
    order.save()

    product.stock -= payload.quantity
    if product.stock == 0:
        product.status = "sold_out"
    product.save(update_fields=["stock", "status"])

    queue_order_notification.delay(order.id, "order.created")
    return order


class PayloadProxy:
    def __init__(self, data):
        self._data = data

    def __getattr__(self, name):
        return self._data.get(name)

    def dict(self):
        return self._data


class ProxyWithDict:
    """Wraps a dict-like or object to provide a .dict() method expected by payloads."""
    def __init__(self, data):
        self._data = data

    def dict(self):
        if hasattr(self._data, 'dict') and callable(getattr(self._data, 'dict')):
            return self._data.dict()
        if isinstance(self._data, dict):
            return self._data
        try:
            return vars(self._data)
        except TypeError:
            return {}


@transaction.atomic
def create_orders_from_cart_payload(payload, buyer=None):
    orders = []
    for item in payload.items:
        item_gift_details = item.gift_details if item.gift_details is not None else payload.gift_details
        item_payload = SimpleNamespace(
            product_id=item.product_id,
            quantity=item.quantity,
            payment_method=payload.payment_method,
            shipping_name=payload.shipping_name,
            buyer_email=payload.buyer_email,
            buyer_phone=payload.buyer_phone,
            shipping_country=payload.shipping_country,
            shipping_address=ProxyWithDict(payload.shipping_address),
            gift_details=ProxyWithDict(item_gift_details) if item_gift_details is not None else None,
        )
        order = create_order_from_payload(item_payload, buyer=buyer)
        orders.append(order)
    return orders


@transaction.atomic
def transition_order(order: Order, new_status: str) -> Order:
    allowed = VALID_STATUS_TRANSITIONS.get(order.status, set())
    if new_status not in allowed and new_status != order.status:
        raise ValueError(
            f"Cannot transition order from {order.status} to {new_status}."
        )

    previous_status = order.status
    order.status = new_status
    if new_status == "paid":
        from django.utils import timezone

        order.paid_at = timezone.now()
    elif new_status == "dispatched":
        from django.utils import timezone

        order.dispatched_at = timezone.now()
    elif new_status == "delivered":
        from django.utils import timezone

        order.delivered_at = timezone.now()

    order.save()

    if new_status == "refunded" and previous_status in {
        "pending_payment",
        "paid",
        "confirmed",
    }:
        product = Product.objects.select_for_update().get(pk=order.product_id)
        product.stock += order.quantity
        if product.status == "sold_out":
            product.status = "active"
        product.save(update_fields=["stock", "status"])

    if new_status == "delivered" and previous_status != "delivered":
        HeritageFundEntry.objects.get_or_create(
            order=order,
            entry_type="contribution",
            craft_tradition=order.product.craft_tradition,
            defaults={
                "amount_ugx": order.heritage_fund_ugx,
                "description": f"Contribution from order #{order.id}",
            },
        )

    queue_order_notification.delay(order.id, f"order.{new_status}")
    return order


@transaction.atomic
def create_return_request(order: Order, payload) -> ReturnRequest:
    if order.status not in {"delivered", "disputed"}:
        raise ValueError("Returns can only be requested after delivery.")

    existing_request = order.return_requests.exclude(status="refunded").first()
    if existing_request:
        raise ValueError("A return request already exists for this order.")

    if order.status == "delivered":
        transition_order(order, "disputed")

    refund_amount = Decimal(str(payload.refund_amount_ugx or order.price_ugx))
    return_request = ReturnRequest.objects.create(
        order=order,
        reason=payload.reason,
        details=payload.details or "",
        refund_amount_ugx=refund_amount,
    )
    queue_order_notification.delay(order.id, "return.requested")
    return return_request
