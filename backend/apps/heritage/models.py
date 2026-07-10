"""
Heritage Fund Models
Transparent impact tracking and community distributions
Thrive With Nature
"""
from django.db import models


class HeritageFundEntry(models.Model):
    """
    Immutable ledger entry - created for every completed order.
    This is the financial transparency layer.
    """

    ENTRY_TYPE_CHOICES = [
        ("contribution", "Contribution"),
        ("distribution", "Distribution"),
    ]

    order = models.ForeignKey(
        "orders.Order", null=True, on_delete=models.SET_NULL, related_name="heritage_entries"
    )
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPE_CHOICES)
    amount_ugx = models.DecimalField(max_digits=14, decimal_places=2)
    craft_tradition = models.ForeignKey(
        "artisans.CraftTradition", on_delete=models.PROTECT, related_name="heritage_entries"
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Heritage Fund Entries"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['craft_tradition']),
            models.Index(fields=['entry_type']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.entry_type}: UGX {self.amount_ugx:,} - {self.craft_tradition.name}"


class Distribution(models.Model):
    """
    Heritage Fund distributions to craft communities
    """

    STATUS_CHOICES = [
        ("proposed", "Proposed"),
        ("approved", "Approved"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    craft_tradition = models.ForeignKey(
        "artisans.CraftTradition", on_delete=models.PROTECT, related_name="distributions"
    )
    amount_ugx = models.DecimalField(max_digits=14, decimal_places=2)
    purpose = models.TextField(help_text="What the distribution is for")
    beneficiaries = models.TextField(help_text="JSON list of beneficiary artisans")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="proposed")
    approved_by = models.ForeignKey(
        "auth.User", on_delete=models.SET_NULL, null=True
    )
    distributed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['craft_tradition']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Distribution to {self.craft_tradition.name} - UGX {self.amount_ugx:,}"
