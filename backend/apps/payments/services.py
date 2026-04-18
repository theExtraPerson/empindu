from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from apps.orders.models import Order
from apps.payments.models import PaymentTransaction


PROVIDER_MESSAGES = {
    "stripe": "Card checkout prepared. Redirect the buyer to complete payment.",
    "momo": "Mobile money request prepared. Prompt the buyer to approve on MTN MoMo.",
    "airtel": "Airtel Money request prepared. Prompt the buyer to approve on their handset.",
    "ton": "Crypto payment reference prepared. Present wallet instructions to the buyer.",
    "manual": "Manual payment fallback created for operations follow-up.",
}


def _normalise_provider(order: Order) -> str:
    provider = order.payment_method or "manual"
    if provider not in {"stripe", "momo", "airtel", "ton"}:
        return "manual"
    return provider


def _build_checkout_url(provider: str, reference: str) -> str:
    if provider == "stripe":
        return f"https://checkout.empindu.local/stripe/{reference}"
    if provider == "ton":
        return f"https://checkout.empindu.local/ton/{reference}"
    return ""


def _build_client_secret(provider: str, reference: str) -> str:
    if provider == "stripe":
        return f"pi_{reference.lower()}"
    return ""


def initiate_payment_for_order(
    order: Order,
    phone_number: str | None = None,
) -> PaymentTransaction:
    provider = _normalise_provider(order)
    reference = f"EMP-{order.id}-{uuid4().hex[:10].upper()}"
    message = PROVIDER_MESSAGES[provider]

    response_payload = {
        "message": message,
        "order_id": order.id,
        "phone_number": phone_number or order.buyer_phone,
        "provider": provider,
    }

    transaction = PaymentTransaction.objects.create(
        order=order,
        provider=provider,
        reference=reference,
        amount_ugx=Decimal(order.price_ugx),
        currency="UGX",
        checkout_url=_build_checkout_url(provider, reference),
        client_secret=_build_client_secret(provider, reference),
        response_payload=response_payload,
    )

    order.payment_reference = reference
    order.save(update_fields=["payment_reference"])
    return transaction
