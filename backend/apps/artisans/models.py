"""
Artisan & Craft Tradition Models
The IP anchor of Empindu - documenting cultural heritage
Thrive With Nature
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from modeltranslation.fields import TranslationField

User = get_user_model()


class CraftTradition(models.Model):
    """
    Represents a named, cultural craft tradition — the IP anchor.
    Examples: 'Kiganda basket weaving', 'Acholi pottery'
    """

    name = models.CharField(max_length=200)
    name_luganda = models.CharField(max_length=200, blank=True)
    ethnic_group = models.CharField(max_length=100)  # 'Baganda', 'Banyankole', etc.
    region = models.CharField(max_length=100)  # 'Central Uganda', 'Western Uganda'
    description = models.TextField(help_text="Cultural context and history")
    gi_status = models.CharField(
        max_length=20,
        choices=[
            ("none", "None"),
            ("pending", "GI Pending"),
            ("registered", "GI Registered"),
        ],
        default="none",
    )
    heritage_fund_levy_pct = models.DecimalField(
        max_digits=4, decimal_places=2, default=3.00
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Craft Traditions"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.ethnic_group})"


class Certification(models.Model):
    """
    Empindu Certified mark - quality and authenticity assurance
    """

    name = models.CharField(max_length=100)
    description = models.TextField()
    requirements = models.TextField(help_text="JSON list of requirements")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Artisan(models.Model):
    """
    Core artisan model. Created on WhatsApp/Telegram onboarding or web signup.
    This is the digital identity transformation layer.
    """

    ONBOARD_CHOICES = [
        ("web", "Web Form"),
        ("whatsapp", "WhatsApp"),
        ("telegram", "Telegram Bot"),
        ("field", "Field Officer"),
    ]

    # Identity
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="artisan"
    )
    slug = models.SlugField(unique=True, max_length=100)

    def _generate_unique_slug(self):
        base_slug = slugify(self.full_name or self.user.username or f"artisan-{self.pk or 'new'}")[:95] or f"artisan-{self.pk or 'new'}"
        slug = base_slug
        counter = 1

        while Artisan.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            counter += 1
            slug = f"{base_slug}-{counter}"

        return slug

    def save(self, *args, **kwargs):
        if not self.slug or not self.slug.strip():
            self.slug = self._generate_unique_slug()

        super().save(*args, **kwargs)

    craft_tradition = models.ForeignKey(
        CraftTradition, on_delete=models.PROTECT, related_name="artisans"
    )
    certifications = models.ManyToManyField(
        Certification, blank=True, related_name="artisans"
    )

    # Bio (multilingual)
    bio = models.TextField(help_text="Written in artisan voice")
    bio_luganda = models.TextField(blank=True)
    bio_swahili = models.TextField(blank=True)

    # Draft bio from voice transcription (reviewed before publishing)
    bio_draft = models.TextField(blank=True, null=True)
    bio_draft_language = models.CharField(max_length=10, blank=True)
    bio_draft_at = models.DateTimeField(null=True, blank=True)

    # Location
    community = models.CharField(max_length=200)  # Village/town
    district = models.CharField(max_length=100)  # District

    # Contact & Payments
    phone = models.CharField(max_length=20)  # WhatsApp number
    momo_number = models.CharField(max_length=20, blank=True)  # MTN MoMo
    airtel_number = models.CharField(max_length=20, blank=True)
    telegram_chat_id = models.BigIntegerField(null=True, blank=True)

    # Status
    is_certified = models.BooleanField(default=False)
    onboarded_via = models.CharField(max_length=20, choices=ONBOARD_CHOICES)
    is_active = models.BooleanField(default=True)

    # Media
    profile_photo = models.ImageField(upload_to="artisans/profiles/", blank=True)
    cover_photo = models.ImageField(upload_to="artisans/covers/", blank=True)

    # Experience
    years_experience = models.PositiveSmallIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Artisans"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_certified']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['craft_tradition']),
            models.Index(fields=['district']),
        ]

    @property
    def full_name(self):
        """Get artisan's full name from user model"""
        return self.user.get_full_name() or self.user.username

    @property
    def total_earnings_ugx(self) -> int:
        """Calculate total earnings from delivered orders"""
        from apps.orders.models import Order

        result = (
            Order.objects.filter(
                artisan=self, status="delivered", payout_status="paid"
            )
            .aggregate(total=models.Sum("artisan_earnings_ugx"))
        )
        return result["total"] or 0

    @property
    def order_count(self) -> int:
        """Count delivered orders"""
        from apps.orders.models import Order

        return Order.objects.filter(artisan=self, status="delivered").count()

    @property
    def has_voice_draft(self):
        """Check if artisan has a draft bio from voice transcription"""
        return bool(self.bio_draft)

    def __str__(self):
        return f"{self.full_name} - {self.craft_tradition.name}"
