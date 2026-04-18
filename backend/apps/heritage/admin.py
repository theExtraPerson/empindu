from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.heritage.models import Distribution, HeritageFundEntry


@admin.register(HeritageFundEntry)
class HeritageFundEntryAdmin(ModelAdmin):
    list_display = [
        "id",
        "entry_type",
        "craft_tradition",
        "amount_ugx",
        "order",
        "created_at",
    ]
    list_filter = ["entry_type", "craft_tradition"]
    search_fields = ["order__id", "description"]
    readonly_fields = ["created_at"]


@admin.register(Distribution)
class DistributionAdmin(ModelAdmin):
    list_display = [
        "id",
        "craft_tradition",
        "amount_ugx",
        "status",
        "approved_by",
        "distributed_at",
    ]
    list_filter = ["status", "craft_tradition"]
    search_fields = ["purpose", "beneficiaries"]
    readonly_fields = ["created_at", "distributed_at"]

