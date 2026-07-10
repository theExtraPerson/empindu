"""
Unfold Admin Configuration for Products
Story-first product catalogue management
"""
from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import action
from apps.products.models import Product, ProductPhoto, ProvenanceRecord


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = [
        "name",
        "artisan_link",
        "craft_tradition",
        "price_ugx",
        "stock",
        "status",
        "is_customisable",
    ]
    list_filter = ["status", "is_customisable", "craft_tradition"]
    search_fields = ["name", "story", "artisan__user__first_name"]
    readonly_fields = [
        "slug",
        "artisan_earnings_ugx",
        "heritage_fund_ugx",
        "created_at",
        "story_draft",
        "story_draft_language",
    ]
    fieldsets = [
        (
            "Attribution",
            {"fields": ["artisan", "craft_tradition"]},
        ),
        (
            "Media",
            {"fields": ["image"]},
        ),
        (
            "Identity & Story",
            {
                "fields": [
                    "name",
                    "slug",
                    "name_luganda",
                    "story",
                    "story_luganda",
                    "story_swahili",
                ]
            },
        ),
        (
            "Voice Draft (Review & Publish)",
            {
                "fields": ["story_draft", "story_draft_language"],
                "description": "Whisper transcription of artisan voice note about this product.",
            },
        ),
        (
            "Craft Details",
            {"fields": ["material", "technique", "days_to_make"]},
        ),
        (
            "Pricing & Revenue Split",
            {
                "fields": [
                    "price_ugx",
                    "price_usd",
                    "artisan_pct",
                    "heritage_pct",
                    "platform_pct",
                    "artisan_earnings_ugx",
                    "heritage_fund_ugx",
                ]
            },
        ),
        (
            "Inventory",
            {"fields": ["stock", "status", "is_customisable", "weight_grams"]},
        ),
    ]

    def artisan_link(self, obj):
        return obj.artisan.full_name

    artisan_link.short_description = "Artisan"


@admin.register(ProductPhoto)
class ProductPhotoAdmin(ModelAdmin):
    list_display = ["product", "caption", "is_hero", "sort_order"]
    list_filter = ["is_hero"]
    search_fields = ["caption", "product__name"]


@admin.register(ProvenanceRecord)
class ProvenanceRecordAdmin(ModelAdmin):
    list_display = [
        "product_link",
        "artisan_name",
        "community",
        "craft_tradition",
        "gi_status",
    ]
    list_filter = ["gi_status", "ethnic_group"]
    search_fields = ["artisan_name", "craft_tradition"]
    readonly_fields = ["created_at", "record_hash"]

    def product_link(self, obj):
        return obj.product.name

    product_link.short_description = "Product"
