"""
Orders API
Core commerce lifecycle, inventory reservation, and returns handling.
Implements Row Level Security (RLS) for artisans and buyers.
"""
from typing import List, Optional
from django.http import HttpRequest

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from api.v1.contracts import (
    OrderCreateIn,
    OrderOut,
    CartCheckoutIn,
    CartCheckoutOut,
    OrderStatusUpdateIn,
    ReturnRequestCreateIn,
    ReturnRequestOut,
)
from apps.orders.models import Order, ReturnRequest
from apps.orders.services import (
    create_order_from_payload,
    create_orders_from_cart_payload,
    create_return_request,
    transition_order,
)

router = Router(tags=["Orders"])


# === Row Level Security (RLS) Helpers ===
def get_user_artisan(user):
    """Get artisan profile for a user, if one exists"""
    if user and hasattr(user, 'artisan'):
        return user.artisan
    return None


def is_admin(user):
    """Check if user is admin or staff"""
    return user and (user.is_staff or user.is_superuser)


def can_view_order(user, order: Order) -> bool:
    """
    RLS: Check if user can view an order
    - Admins can view all orders
    - Artisans can view their own orders
    - Buyers can view their own orders
    """
    if not user or not user.is_authenticated:
        return False
    
    # Admins see everything
    if is_admin(user):
        return True
    
    # Artisan can see their own orders
    artisan = get_user_artisan(user)
    if artisan and order.artisan_id == artisan.id:
        return True
    
    # Buyer can see their own orders
    if order.buyer_id == user.id:
        return True
    
    return False


def can_update_order(user, order: Order) -> bool:
    """
    RLS: Check if user can update an order
    - Only artisans and admins can update orders
    - Artisans can only update their own orders
    """
    if not user or not user.is_authenticated:
        return False
    
    # Admins can update all
    if is_admin(user):
        return True
    
    # Artisan can only update their own
    artisan = get_user_artisan(user)
    if artisan and order.artisan_id == artisan.id:
        return True
    
    return False


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


@router.get("", response=List[OrderOut])
def list_orders(request, buyer_email: Optional[str] = None):
    """
    List orders with RLS enforcement.
    
    Access Rules:
    - Admins see all orders
    - Artisans see only their own orders
    - Buyers see only their own orders
    """
    user = request.auth
    
    if is_admin(user):
        # Admin: see all orders
        queryset = Order.objects.select_related("product", "artisan__user")
        if buyer_email:
            queryset = queryset.filter(buyer_email__iexact=buyer_email)
        return [serialize_order(order) for order in queryset[:100]]
    
    # Artisan: see only their own orders
    artisan = get_user_artisan(user)
    if artisan:
        queryset = Order.objects.filter(artisan=artisan).select_related(
            "product", "artisan__user"
        )
        return [serialize_order(order) for order in queryset[:100]]
    
    # Buyer: see only their own orders
    if user and user.is_authenticated:
        queryset = Order.objects.filter(buyer=user).select_related(
            "product", "artisan__user"
        )
        return [serialize_order(order) for order in queryset[:100]]
    
    # Unauthenticated: empty list
    return []


@router.post("", response=OrderOut, auth=None)
def create_order(request, payload: OrderCreateIn):
    buyer = request.auth if getattr(request, "auth", None) else None
    order = create_order_from_payload(payload, buyer=buyer)
    return serialize_order(order)


@router.post("/checkout", response=CartCheckoutOut, auth=None)
def checkout_cart(request, payload: CartCheckoutIn):
    buyer = request.auth if getattr(request, "auth", None) else None
    orders = create_orders_from_cart_payload(payload, buyer=buyer)
    total_amount = sum(float(order.price_ugx) for order in orders)
    return {
        "order_ids": [order.id for order in orders],
        "order_count": len(orders),
        "total_amount_ugx": total_amount,
        "status": "pending_payment",
        "payment_url": None,
        "orders": [serialize_order(order) for order in orders],
    }


@router.get("/{order_id}", response=OrderOut)
def get_order(request, order_id: int):
    """
    Get order details with RLS enforcement.
    """
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )
    
    if not can_view_order(request.auth, order):
        raise HttpError(403, "You don't have permission to view this order")
    
    return serialize_order(order)


@router.get("/{order_id}/confirm", response=OrderOut, auth=None)
def confirm_order(request, order_id: int, buyer_email: Optional[str] = None):
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )

    if buyer_email and order.buyer_email and order.buyer_email.strip().lower() == buyer_email.strip().lower():
        return serialize_order(order)

    raise HttpError(403, "Buyer email must match to view this order.")


@router.patch("/{order_id}/status", response=OrderOut)
def update_order_status(request, order_id: int, payload: OrderStatusUpdateIn):
    """
    Update order status with RLS enforcement.
    Only artisans (for their own orders) and admins can update.
    """
    order = get_object_or_404(
        Order.objects.select_related("product", "artisan__user"),
        pk=order_id,
    )
    
    if not can_update_order(request.auth, order):
        raise HttpError(
            403, 
            "Only the artisan or admin can update this order"
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
