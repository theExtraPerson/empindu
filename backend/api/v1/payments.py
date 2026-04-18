"""
Payments API
Provider orchestration layer for checkout initiation.
"""
from django.shortcuts import get_object_or_404
from ninja import Router

from api.v1.contracts import PaymentInitIn, PaymentIntentOut
from apps.orders.models import Order
from apps.payments.services import initiate_payment_for_order

router = Router(tags=["Payments"])


@router.post("/initiate", response=PaymentIntentOut)
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
