"""
Gifting API
Single and bulk gifting workflows for the story-first commerce layer.
"""
from decimal import Decimal
from typing import List

from django.db import transaction
from django.utils.dateparse import parse_date
from ninja import Router

from api.v1.contracts import GiftOrderCreateIn, GiftOrderOut
from apps.gifting.models import GiftOrder, GiftOrderItem, GiftOrderRecipient
from apps.products.models import Product
from apps.telegram_bot.announcements import send_telegram_announcement

router = Router(tags=["Gifting"])


def serialize_gift_order(gift_order: GiftOrder) -> dict:
    return {
        "id": gift_order.id,
        "customer_name": gift_order.customer_name,
        "customer_email": gift_order.customer_email,
        "contact_phone": gift_order.contact_phone,
        "company": gift_order.company,
        "occasion": gift_order.occasion,
        "gift_message": gift_order.gift_message,
        "branding_notes": gift_order.branding_notes,
        "delivery_date": gift_order.delivery_date.isoformat() if gift_order.delivery_date else None,
        "recipient_count": gift_order.recipient_count,
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
                "personalization": item.personalization,
            }
            for item in gift_order.items.select_related("product").all()
        ],
        "recipients": [
            {
                "name": recipient.name,
                "email": recipient.email,
                "phone": recipient.phone,
                "address": recipient.address,
                "city": recipient.city,
                "country": recipient.country,
                "personal_message": recipient.personal_message,
            }
            for recipient in gift_order.recipients.all()
        ],
        "created_at": gift_order.created_at.isoformat(),
        "updated_at": gift_order.updated_at.isoformat(),
    }


@router.get("", response=List[GiftOrderOut])
def list_gift_orders(request):
    """Only admins may list all gift orders (contains PII for many customers)."""
    user = getattr(request, "auth", None)
    if not user or not user.is_authenticated or not (
        getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
    ):
        from ninja.errors import HttpError
        raise HttpError(403, "Admin access required")
    queryset = GiftOrder.objects.prefetch_related("items__product", "recipients").all()[:100]
    return [serialize_gift_order(gift_order) for gift_order in queryset]



@router.post("", response=GiftOrderOut, auth=None)
@transaction.atomic
def create_gift_order(request, payload: GiftOrderCreateIn):
    if not payload.items:
        raise ValueError("At least one gift order item is required.")
    if not payload.recipients:
        raise ValueError("At least one recipient is required.")

    total_amount = Decimal("0")
    total_items = 0
    gift_order = GiftOrder.objects.create(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        contact_phone=payload.contact_phone or "",
        company=payload.company or "",
        occasion=payload.occasion or "",
        gift_message=payload.gift_message or "",
        branding_notes=payload.branding_notes or "",
        delivery_date=parse_date(payload.delivery_date) if payload.delivery_date else None,
        recipient_count=len(payload.recipients),
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
            personalization=item.personalization or "",
        )

        product.stock -= item.quantity
        if product.stock == 0:
            product.status = "sold_out"
        product.save(update_fields=["stock", "status"])

        total_items += item.quantity
        total_amount += line_total

    gift_order.total_items = total_items
    gift_order.total_amount_ugx = total_amount
    gift_order.recipient_count = len(payload.recipients)

    for recipient in payload.recipients:
        GiftOrderRecipient.objects.create(
            gift_order=gift_order,
            name=recipient.name,
            email=recipient.email or "",
            phone=recipient.phone or "",
            address=recipient.address or "",
            city=recipient.city or "",
            country=recipient.country or "",
            personal_message=recipient.personal_message or "",
        )

    gift_order.save(update_fields=["total_items", "total_amount_ugx", "recipient_count", "updated_at"])
    gift_order.refresh_from_db()
    send_telegram_announcement(
        f"*New Empindu gift order*\n"
        f"Order #{gift_order.id} - {gift_order.recipient_count} recipient(s)\n"
        f"UGX {int(gift_order.total_amount_ugx):,}\n"
        f"{request.build_absolute_uri('/').rstrip('/')}/gifting"
    )
    return serialize_gift_order(gift_order)
