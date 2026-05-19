"""
Gift Commerce Models
Dedicated flow for emotionally motivated gifting purchases.
"""
from django.db import models


class GiftDetails(models.Model):
    OCCASION_CHOICES = [
        ("birthday", "Birthday"),
        ("wedding", "Wedding"),
        ("graduation", "Graduation"),
        ("baby_shower", "Baby Shower"),
        ("thank_you", "Saying Thank You"),
        ("cultural", "Cultural Celebration"),
        ("just_because", "Just Because"),
    ]

    recipient_name = models.CharField(max_length=200)
    recipient_relationship = models.CharField(
        max_length=100, help_text="e.g., Mother, Friend, Colleague"
    )
    occasion = models.CharField(max_length=20, choices=OCCASION_CHOICES)
    personal_message = models.TextField(
        max_length=500, help_text="Printed on handwritten-style card"
    )
    gift_wrap = models.BooleanField(default=True)
    scheduled_delivery_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Gift for {self.recipient_name} - {self.get_occasion_display()}"


class GiftOrder(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_payment", "Pending Payment"),
        ("paid", "Paid"),
        ("processing", "Processing"),
        ("completed", "Completed"),
    ]

    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    contact_phone = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=200, blank=True)
    occasion = models.CharField(max_length=100, blank=True)
    gift_message = models.TextField(blank=True)
    branding_notes = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    recipient_count = models.PositiveIntegerField(default=1)
    total_items = models.PositiveIntegerField(default=0)
    total_amount_ugx = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Gift Orders"

    def __str__(self):
        return f"Gift Order #{self.id} - {self.customer_name}"


class GiftOrderItem(models.Model):
    gift_order = models.ForeignKey(
        GiftOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="gift_order_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    line_total_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    personalization = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"Gift item #{self.id} for order #{self.gift_order_id}"


class GiftOrderRecipient(models.Model):
    gift_order = models.ForeignKey(
        GiftOrder,
        on_delete=models.CASCADE,
        related_name="recipients",
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=80, blank=True)
    personal_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} for gift order #{self.gift_order_id}"
