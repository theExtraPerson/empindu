"""
Orders API
Core commerce lifecycle, inventory reservation, and returns handling.
"""
from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from api.v1.contracts import (
    OrderCreateIn,
    OrderOut,
    OrderStatusUpdateIn,
    ReturnRequestCreateIn,
    ReturnRequestOut,
)
from apps.orders.models import Order, ReturnRequest
from apps.orders.services import (
    create_order_from_payload,
    create_return_request,
    transition_order,
)

router = Router(tags=["Orders"])


def serialize_order(order: Order) -> dict:
    return {
        "id": order.id,
        "product_id": order.product_id,
        "product_name": order.product.name,
        "artisan_name": order.artisan.full_name,
        "quantity": order.quantity,
        "status": order.status,
        "payout_status": order.payout_status,
        "payment_method": order.payment_method,
        "buyer_email": order.buyer_email,
        "buyer_phone": order.buyer_phone,
        "shipping_name": order.shipping_name,
        "shipping_country": order.shipping_country,
        "price_ugx": float(order.price_ugx),
        "price_usd": float(order.price_usd),
        "artisan_earnings_ugx": float(order.artisan_earnings_ugx),
        "platform_commission_ugx": float(order.platform_commission_ugx),
        "heritage_fund_ugx": float(order.heritage_fund_ugx),
        "payment_reference": order.payment_reference,
        "tracking_number": order.tracking_number,
        "created_at": order.created_at.isoformat(),
    }


def serialize_return_request(return_request: ReturnRequest) -> dict:
    return {
        "id": return_request.id,
        "order_id": return_request.order_id,
        "reason": return_request.reason,
        "details": return_request.details,
        "status": return_request.status,
        "refund_amount_ugx": float(return_request.refund_amount_ugx),
        "created_at": return_request.created_at.isoformat(),
        "reviewed_at": return_request.reviewed_at.isoformat() if return_request.reviewed_at else None,
        "completed_at": return_request.completed_at.isoformat() if return_request.completed_at else None,
    }


@router.get("", response=List[OrderOut], auth=None)
def list_orders(request, buyer_email: Optional[str] = None):
    queryset = Order.objects.select_related("product", "artisan__user")
    if buyer_email:
        queryset = queryset.filter(buyer_email__iexact=buyer_email)
    return [serialize_order(order) for order in queryset[:100]]


@router.post("", response=OrderOut, auth=None)
def create_order(request, payload: OrderCreateIn):
    buyer = request.auth if getattr(request, "auth", None) else None
    order = create_order_from_payload(payload, buyer=buyer)
    return serialize_order(order)


@router.get("/{order_id}", response=OrderOut, auth=None)
def get_order(request, order_id: int):
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )
    return serialize_order(order)


@router.patch("/{order_id}/status", response=OrderOut)
def update_order_status(request, order_id: int, payload: OrderStatusUpdateIn):
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )
    order = transition_order(order, payload.status)
    return serialize_order(order)


@router.get("/{order_id}/returns", response=List[ReturnRequestOut], auth=None)
def list_return_requests(request, order_id: int):
    order = get_object_or_404(Order, pk=order_id)
    queryset = order.return_requests.all()
    return [serialize_return_request(item) for item in queryset]


@router.post("/{order_id}/returns", response=ReturnRequestOut, auth=None)
def request_return(request, order_id: int, payload: ReturnRequestCreateIn):
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )
    return_request = create_return_request(order, payload)
    return serialize_return_request(return_request)
