"""
Gifting API
Single and bulk gifting workflows for the story-first commerce layer.
"""
from decimal import Decimal
from typing import List

from django.db import transaction
from ninja import Router

from api.v1.contracts import GiftOrderCreateIn, GiftOrderOut
from apps.gifting.models import GiftOrder, GiftOrderItem
from apps.products.models import Product

router = Router(tags=["Gifting"])


def serialize_gift_order(gift_order: GiftOrder) -> dict:
    return {
        "id": gift_order.id,
        "customer_name": gift_order.customer_name,
        "customer_email": gift_order.customer_email,
        "company": gift_order.company,
        "notes": gift_order.notes,
        "total_items": gift_order.total_items,
        "total_amount_ugx": float(gift_order.total_amount_ugx),
        "status": gift_order.status,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name,
                "quantity": item.quantity,
                "unit_price_ugx": float(item.unit_price_ugx),
                "line_total_ugx": float(item.line_total_ugx),
            }
            for item in gift_order.items.select_related("product").all()
        ],
        "created_at": gift_order.created_at.isoformat(),
        "updated_at": gift_order.updated_at.isoformat(),
    }


@router.get("", response=List[GiftOrderOut])
def list_gift_orders(request):
    queryset = GiftOrder.objects.prefetch_related("items__product").all()[:100]
    return [serialize_gift_order(gift_order) for gift_order in queryset]


@router.post("", response=GiftOrderOut, auth=None)
@transaction.atomic
def create_gift_order(request, payload: GiftOrderCreateIn):
    if not payload.items:
        raise ValueError("At least one gift order item is required.")

    total_amount = Decimal("0")
    total_items = 0
    gift_order = GiftOrder.objects.create(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        company=payload.company or "",
        notes=payload.notes or "",
        total_items=0,
        total_amount_ugx=Decimal("0"),
        status="pending_payment",
    )

    for item in payload.items:
        product = Product.objects.select_for_update().get(pk=item.product_id, status="active")
        if item.quantity < 1:
            raise ValueError("Gift order quantity must be at least 1.")
        if product.stock < item.quantity:
            raise ValueError(f"Insufficient stock for {product.name}.")

        line_total = Decimal(product.price_ugx) * item.quantity
        GiftOrderItem.objects.create(
            gift_order=gift_order,
            product=product,
            quantity=item.quantity,
            unit_price_ugx=product.price_ugx,
            line_total_ugx=line_total,
        )

        product.stock -= item.quantity
        if product.stock == 0:
            product.status = "sold_out"
        product.save(update_fields=["stock", "status"])

        total_items += item.quantity
        total_amount += line_total

    gift_order.total_items = total_items
    gift_order.total_amount_ugx = total_amount
    gift_order.save(update_fields=["total_items", "total_amount_ugx", "updated_at"])
    gift_order.refresh_from_db()
    return serialize_gift_order(gift_order)
