from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from apps.orders.models import Order
from apps.payments.models import PaymentTransaction
from apps.payments.models import Payout
from django.conf import settings
from django.utils import timezone
from apps.orders.services import transition_order
from apps.heritage.models import HeritageFundEntry
from apps.notifications.tasks import queue_order_notification
from apps.artisans.models import Artisan

import math
import logging

logger = logging.getLogger(__name__)


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

    # If provider is stripe, attempt to create a real Checkout Session
    if provider == 'stripe':
        try:
            import stripe

            stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
            success_url = getattr(settings, 'FRONTEND_SUCCESS_URL', 'http://localhost:3000/checkout/success')
            cancel_url = getattr(settings, 'FRONTEND_CANCEL_URL', 'http://localhost:3000/checkout')

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='payment',
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {'name': order.product.name},
                        'unit_amount': int(float(order.price_usd) * 100),
                    },
                    'quantity': int(order.quantity),
                }],
                metadata={'order_id': str(order.id), 'reference': reference},
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
            )

            transaction.checkout_url = session.url
            transaction.client_secret = session.id
            transaction.response_payload = {**transaction.response_payload, 'stripe_session': session.id}
            transaction.save(update_fields=['checkout_url', 'client_secret', 'response_payload'])
        except Exception:
            logger.exception('Stripe session creation failed')

    return transaction


def _round_amount(value: Decimal) -> int:
    return int(math.floor(value))


def create_payouts_for_order(order: Order, transaction: PaymentTransaction) -> list[Payout]:
    """Create payout records for the order based on provider rules.

    Splits (mobile money): artisan 85%, empindu 12%, heritage 3%.
    For stripe or other providers, create platform and heritage entries; artisan payout marked pending.
    """
    total = Decimal(transaction.amount_ugx)
    payouts = []

    # Heritage amount (3%) — create HeritageFundEntry
    heritage_amount = (total * Decimal('0.03')).quantize(Decimal('1.'))
    HeritageFundEntry.objects.get_or_create(
        order=order,
        entry_type="contribution",
        craft_tradition=order.product.craft_tradition,
        defaults={
            "amount_ugx": heritage_amount,
            "description": f"Heritage contribution from payment {transaction.reference}",
        },
    )

    # Platform share (12%)
    platform_amount = (total * Decimal('0.12')).quantize(Decimal('1.'))
    payouts.append(
        Payout.objects.create(
            order=order,
            artisan=order.artisan,
            amount_ugx=platform_amount,
            provider='bank',
            to_account=getattr(settings, 'EMPINDU_PLATFORM_ACCOUNT', 'empindu-bank-account'),
            status='pending',
        )
    )

    # Artisan share
    artisan_amount = total - heritage_amount - platform_amount
    artisan: Artisan = order.artisan
    if transaction.provider == 'momo':
        artisan_account = artisan.momo_number or artisan.phone
        artisan_provider = 'momo'
    elif transaction.provider == 'airtel':
        artisan_account = artisan.airtel_number or artisan.phone
        artisan_provider = 'airtel'
    else:
        artisan_account = artisan.momo_number or artisan.airtel_number or artisan.phone
        artisan_provider = 'bank'

    payouts.append(
        Payout.objects.create(
            order=order,
            artisan=order.artisan,
            amount_ugx=artisan_amount,
            provider=artisan_provider,
            to_account=artisan_account,
            status='pending',
        )
    )

    # mark order payout status as processing
    order.payout_status = 'processing'
    order.save(update_fields=['payout_status'])

    return payouts


def update_order_payout_status(order: Order) -> None:
    payouts = list(order.payouts.all())
    if not payouts:
        order.payout_status = 'pending'
    elif all(p.status == 'sent' for p in payouts):
        order.payout_status = 'paid'
    elif any(p.status == 'failed' for p in payouts):
        order.payout_status = 'failed'
    elif any(p.status == 'processing' for p in payouts):
        order.payout_status = 'processing'
    else:
        order.payout_status = 'pending'
    order.save(update_fields=['payout_status'])


def process_payout(payout: Payout, status: str, external_reference: str | None = None) -> Payout:
    payout.status = status
    if external_reference:
        payout.external_reference = external_reference
    if status == 'sent':
        payout.processed_at = timezone.now()
    payout.save(update_fields=['status', 'external_reference', 'processed_at'])
    update_order_payout_status(payout.order)
    return payout


def process_provider_callback(reference: str, status: str, external_reference: str | None = None, payload: dict | None = None):
    """Called by webhooks when a provider confirms/updates a payment."""
    try:
        transaction = PaymentTransaction.objects.get(reference=reference)
    except PaymentTransaction.DoesNotExist:
        return None

    transaction.external_reference = external_reference or transaction.external_reference
    transaction.response_payload = {**(transaction.response_payload or {}), **(payload or {})}
    if status in {'completed', 'success', 'paid'}:
        transaction.status = 'completed'
        transaction.completed_at = timezone.now()
        transaction.save(update_fields=['status', 'external_reference', 'response_payload', 'completed_at'])

        # mark order as paid
        order = transaction.order
        try:
            transition_order(order, 'paid')
        except Exception:
            order.status = 'paid'
            order.paid_at = timezone.now()
            order.save(update_fields=['status', 'paid_at'])

        # create payouts and heritage entry
        create_payouts_for_order(order, transaction)

        # notify buyer and operations
        queue_order_notification.delay(order.id, 'order.paid')
    else:
        transaction.status = 'failed'
        transaction.save(update_fields=['status', 'external_reference', 'response_payload'])

    return transaction
