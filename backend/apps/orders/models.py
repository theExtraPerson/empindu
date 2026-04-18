"""
Order Lifecycle Models
State machine for order processing from payment to delivery
Thrive With Nature
"""
from django.db import models
from django.conf import settings


class Order(models.Model):
    """
    Core order model with complete lifecycle tracking.
    Frozen financial snapshot at order time.
    """

    STATUS_CHOICES = [
        ("pending_payment", "Pending Payment"),
        ("paid", "Paid - Awaiting Artisan Confirmation"),
        ("confirmed", "Artisan Confirmed"),
        ("dispatched", "Dispatched"),
        ("in_transit", "In Transit"),
        ("delivered", "Delivered"),
        ("disputed", "Disputed"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("stripe", "Stripe"),
        ("momo", "MTN MoMo"),
        ("airtel", "Airtel Money"),
        ("ton", "TON Crypto"),
    ]

    PAYOUT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    # Product & Parties
    product = models.ForeignKey(
        "products.Product", on_delete=models.PROTECT, related_name="orders"
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    artisan = models.ForeignKey(
        "artisans.Artisan", on_delete=models.PROTECT, related_name="orders_as_artisan"
    )

    # Status
    status = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default="pending_payment"
    )
    payout_status = models.CharField(
        max_length=20, choices=PAYOUT_STATUS_CHOICES, default="pending"
    )

    # Gift Flag
    is_gift = models.BooleanField(default=False)
    gift_details = models.OneToOneField(
        "gifting.GiftDetails",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="order",
    )

    # Quantity
    quantity = models.PositiveSmallIntegerField(default=1)

    # Financial Snapshot (frozen at order time)
    price_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    price_usd = models.DecimalField(max_digits=8, decimal_places=2)
    artisan_earnings_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    platform_commission_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    heritage_fund_ugx = models.DecimalField(max_digits=12, decimal_places=2)

    # Payment
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    payment_reference = models.CharField(max_length=200, blank=True)
    buyer_email = models.EmailField(blank=True)
    buyer_phone = models.CharField(max_length=30, blank=True)

    # Shipping
    shipping_name = models.CharField(max_length=200)
    shipping_address = models.JSONField(
        help_text="{line1, city, country, postcode}"
    )
    shipping_country = models.CharField(
        max_length=2, help_text="ISO 3166-1 alpha-2"
    )  # e.g., 'UG', 'GB', 'US'
    tracking_number = models.CharField(max_length=100, blank=True)
    dispatch_photo = models.ImageField(upload_to="orders/dispatch/", blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.product.name} by {self.artisan.full_name}"

    def calculate_totals(self):
        """Calculate all financial fields based on product pricing"""
        self.price_ugx = self.product.price_ugx * self.quantity
        self.price_usd = self.product.price_usd * self.quantity
        self.artisan_earnings_ugx = (
            self.product.artisan_earnings_ugx * self.quantity
        )
        self.heritage_fund_ugx = self.product.heritage_fund_ugx * self.quantity
        self.platform_commission_ugx = (
            self.price_ugx - self.artisan_earnings_ugx - self.heritage_fund_ugx
        )


class ReturnRequest(models.Model):
    STATUS_CHOICES = [
        ("requested", "Requested"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("refunded", "Refunded"),
    ]

    REASON_CHOICES = [
        ("damaged", "Damaged"),
        ("wrong_item", "Wrong Item"),
        ("not_as_described", "Not As Described"),
        ("late_delivery", "Late Delivery"),
        ("other", "Other"),
    ]

    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="return_requests"
    )
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="requested")
    refund_amount_ugx = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Return #{self.id} for order #{self.order_id}"
