"""
Unfold Admin Configuration for Artisans
Story-first artisan management interface
"""
from django.contrib import admin
from unfold.admin import ModelAdmin
from apps.artisans.models import Artisan, CraftTradition, Certification


@admin.register(Artisan)
class ArtisanAdmin(ModelAdmin):
    list_display = [
        "full_name",
        "community",
        "craft_tradition",
        "is_certified",
        "has_voice_draft",
        "order_count",
    ]
    list_filter = [
        "is_certified",
        "craft_tradition__ethnic_group",
        "district",
        "onboarded_via",
    ]
    search_fields = ["user__first_name", "user__last_name", "community"]
    readonly_fields = [
        "total_earnings_ugx",
        "order_count",
        "created_at",
        "bio_draft",
        "bio_draft_language",
    ]
    fieldsets = [
        (
            "Identity",
            {
                "fields": [
                    "user",
                    "slug",
                    "craft_tradition",
                    "certifications",
                    "is_certified",
                ]
            },
        ),
        ("Location", {"fields": ["community", "district"]}),
        (
            "Published Bio",
            {"fields": ["bio", "bio_luganda", "bio_swahili"]},
        ),
        (
            "Voice Draft (Review & Publish)",
            {
                "fields": ["bio_draft", "bio_draft_language"],
                "description": "Whisper transcription of artisan voice note. Edit and copy to Published Bio when ready.",
            },
        ),
        ("Payments", {"fields": ["momo_number", "airtel_number"]}),
        ("Stats", {"fields": ["total_earnings_ugx", "order_count", "created_at"]}),
    ]

    def certify_artisans(self, request, queryset):
        count = queryset.update(is_certified=True)
        self.message_user(
            request, f"{count} artisans certified with Empindu mark."
        )
    
    certify_artisans.short_description = "Certify selected artisans"
    certify_artisans.allowed_permissions = ("change",)


@admin.register(CraftTradition)
class CraftTraditionAdmin(ModelAdmin):
    list_display = [
        "name",
        "ethnic_group",
        "region",
        "gi_status",
        "heritage_fund_levy_pct",
    ]
    list_filter = ["ethnic_group", "region", "gi_status"]
    search_fields = ["name", "description"]
    ordering = ["name"]


@admin.register(Certification)
class CertificationAdmin(ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
