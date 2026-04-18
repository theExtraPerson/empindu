from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("buyer", "Buyer"),
        ("artisan", "Artisan"),
        ("admin", "Administrator"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="buyer")
    phone = models.CharField(max_length=32, blank=True)
    location = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    craft_specialty = models.CharField(max_length=255, blank=True)
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    portfolio_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__email"]
        verbose_name = "User profile"
        verbose_name_plural = "User profiles"

    def __str__(self):
        return self.user.get_full_name() or self.user.email or self.user.username
