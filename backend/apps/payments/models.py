from django.db import models


class PaymentTransaction(models.Model):
    PROVIDER_CHOICES = [
        ("stripe", "Stripe"),
        ("momo", "MTN MoMo"),
        ("airtel", "Airtel Money"),
        ("ton", "TON Crypto"),
        ("manual", "Manual"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="payment_transactions",
    )
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reference = models.CharField(max_length=100, unique=True)
    external_reference = models.CharField(max_length=200, blank=True)
    amount_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="UGX")
    checkout_url = models.URLField(blank=True)
    client_secret = models.CharField(max_length=255, blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.provider} payment {self.reference}"

