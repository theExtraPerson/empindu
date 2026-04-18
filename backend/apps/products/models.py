"""
Product & Provenance Models
Story-first product architecture with cultural IP anchoring
Thrive With Nature
"""
from django.db import models
from pgvector.django import VectorField


class Product(models.Model):
    """
    Core product model with story-first architecture.
    Each product is anchored to an artisan and craft tradition.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("sold_out", "Sold Out"),
        ("archived", "Archived"),
    ]

    # Attribution
    artisan = models.ForeignKey(
        "artisans.Artisan", on_delete=models.CASCADE, related_name="listings"
    )
    craft_tradition = models.ForeignKey(
        "artisans.CraftTradition", on_delete=models.SET_NULL, null=True
    )

    # Identity
    slug = models.SlugField(unique=True, max_length=150)
    name = models.CharField(max_length=300)
    name_luganda = models.CharField(max_length=300, blank=True)

    # Story (leads the product page)
    story = models.TextField(help_text="Artisan narrative - from voice note or written")
    story_luganda = models.TextField(blank=True)
    story_swahili = models.TextField(blank=True)

    # Draft story from voice transcription
    story_draft = models.TextField(blank=True, null=True)
    story_draft_language = models.CharField(max_length=10, blank=True)
    story_draft_at = models.DateTimeField(null=True, blank=True)

    # Craft Details
    material = models.CharField(
        max_length=300, help_text="e.g., Natural sisal from family land"
    )
    technique = models.CharField(
        max_length=400, help_text="e.g., Kiganda coiling - 3-strand plait"
    )
    days_to_make = models.PositiveSmallIntegerField(default=1)

    # Pricing & Revenue Split
    price_ugx = models.DecimalField(max_digits=12, decimal_places=2)
    price_usd = models.DecimalField(max_digits=8, decimal_places=2)
    artisan_pct = models.DecimalField(
        max_digits=4, decimal_places=2, default=85.00
    )  # Artisan share
    heritage_pct = models.DecimalField(
        max_digits=4, decimal_places=2, default=3.00
    )  # Heritage Fund
    platform_pct = models.DecimalField(
        max_digits=4, decimal_places=2, default=12.00
    )  # Platform commission

    # Inventory
    stock = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Customisation
    is_customisable = models.BooleanField(default=False)

    # Shipping
    weight_grams = models.PositiveIntegerField(default=0)

    # Semantic search embedding (updated by Celery task)
    embedding = VectorField(dimensions=384, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def artisan_earnings_ugx(self) -> int:
        """Calculate artisan earnings per unit"""
        return int(self.price_ugx * self.artisan_pct / 100)

    @property
    def heritage_fund_ugx(self) -> int:
        """Calculate Heritage Fund contribution per unit"""
        return int(self.price_ugx * self.heritage_pct / 100)

    def __str__(self):
        return f"{self.name} by {self.artisan.full_name}"


class ProductPhoto(models.Model):
    """
    Product photography - multiple images per product
    """

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="products/photos/")
    caption = models.CharField(max_length=300, blank=True)
    is_hero = models.BooleanField(default=False)  # Primary display image
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "-is_hero"]

    def __str__(self):
        return f"Photo for {self.product.name}"


class ProvenanceRecord(models.Model):
    """
    The IP anchor - immutable record created at listing time.
    This is what makes Empindu discontinuous - permanent cultural attribution.
    """

    product = models.OneToOneField(
        Product, on_delete=models.CASCADE, related_name="provenance"
    )

    # Snapshot at listing time
    artisan_name = models.CharField(max_length=200)
    community = models.CharField(max_length=200)
    district = models.CharField(max_length=100)
    craft_tradition = models.CharField(max_length=200)
    ethnic_group = models.CharField(max_length=100)
    technique_detail = models.TextField()
    material_source = models.CharField(max_length=300)
    gi_status = models.CharField(max_length=20)

    # Blockchain anchor (future)
    record_hash = models.CharField(max_length=64, blank=True)

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Provenance Records"

    def __str__(self):
        return f"Provenance: {self.product.name} by {self.artisan_name}"
