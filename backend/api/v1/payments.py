"""
Payments API
Provider orchestration layer for checkout initiation.
"""
from datetime import datetime
from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from api.v1.contracts import PaymentInitIn, PaymentIntentOut, PayoutOut, PayoutUpdateIn
from apps.orders.models import Order
from apps.payments.models import Payout
from apps.payments.services import initiate_payment_for_order, process_provider_callback, process_payout


class WebhookIn(Schema):
    provider: str
    reference: str
    status: str
    external_reference: str | None = None
    payload: dict | None = None


class PayoutListQuery(Schema):
    status: Optional[str] = None
    provider: Optional[str] = None


router = Router(tags=["Payments"])


@router.post("/initiate", response=PaymentIntentOut, auth=None)
def initiate_payment(request, payload: PaymentInitIn):
    order = get_object_or_404(Order, pk=payload.order_id)
    transaction = initiate_payment_for_order(order, phone_number=payload.phone_number)
    return {
        "provider": transaction.provider,
        "status": transaction.status,
        "reference": transaction.reference,
        "amount_ugx": float(transaction.amount_ugx),
        "currency": transaction.currency,
        "checkout_url": transaction.checkout_url or None,
        "client_secret": transaction.client_secret or None,
        "message": transaction.response_payload.get("message", "Payment prepared."),
    }


def is_admin(user) -> bool:
    return user and getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False)


@router.post('/webhook', auth=None)
def payment_webhook(request, payload: WebhookIn):
    """
    Generic webhook receiver for payment providers.
    Requires a shared secret header (X-Webhook-Secret) matching the
    PAYMENTS_WEBHOOK_SECRET setting. Providers with real signature
    schemes (Stripe/Flutterwave/etc.) should be handled in provider-
    specific endpoints that verify the signature cryptographically.
    """
    import hmac
    from django.conf import settings
    from ninja.errors import HttpError

    expected = getattr(settings, "PAYMENTS_WEBHOOK_SECRET", "") or ""
    supplied = request.headers.get("X-Webhook-Secret", "") or ""
    if not expected or not supplied or not hmac.compare_digest(expected, supplied):
        raise HttpError(401, "Invalid webhook signature")

    tx = process_provider_callback(payload.reference, payload.status, external_reference=payload.external_reference, payload=payload.payload)
    if not tx:
        return {"detail": "transaction not found"}
    return {"ok": True, "status": tx.status, "reference": tx.reference}



@router.get('/payouts', response=List[PayoutOut])
def list_payouts(request, status: Optional[str] = None, provider: Optional[str] = None):
    if not is_admin(request.auth):
        return []
    queryset = Payout.objects.select_related('order', 'artisan')
    if status:
        queryset = queryset.filter(status=status)
    if provider:
        queryset = queryset.filter(provider=provider)
    return [
        {
            'id': payout.id,
            'order_id': payout.order_id,
            'artisan_id': payout.artisan_id,
            'artisan_name': payout.artisan.full_name,
            'amount_ugx': float(payout.amount_ugx),
            'provider': payout.provider,
            'to_account': payout.to_account,
            'status': payout.status,
            'external_reference': payout.external_reference,
            'created_at': payout.created_at.isoformat(),
            'processed_at': payout.processed_at.isoformat() if payout.processed_at else None,
        }
        for payout in queryset[:200]
    ]


@router.patch('/payouts/{payout_id}', response=PayoutOut)
def update_payout(request, payout_id: int, payload: PayoutUpdateIn):
    if not is_admin(request.auth):
        return {"detail": "forbidden"}
    payout = get_object_or_404(Payout, pk=payout_id)
    payout = process_payout(payout, payload.status, external_reference=payload.external_reference)
    return {
        'id': payout.id,
        'order_id': payout.order_id,
        'artisan_id': payout.artisan_id,
        'artisan_name': payout.artisan.full_name,
        'amount_ugx': float(payout.amount_ugx),
        'provider': payout.provider,
        'to_account': payout.to_account,
        'status': payout.status,
        'external_reference': payout.external_reference,
        'created_at': payout.created_at.isoformat(),
        'processed_at': payout.processed_at.isoformat() if payout.processed_at else None,
    }
