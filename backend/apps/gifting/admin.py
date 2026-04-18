from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.gifting.models import GiftDetails, GiftOrder, GiftOrderItem


class GiftOrderItemInline(admin.TabularInline):
    model = GiftOrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "unit_price_ugx", "line_total_ugx", "created_at"]
    can_delete = False


@admin.register(GiftDetails)
class GiftDetailsAdmin(ModelAdmin):
    list_display = [
        "recipient_name",
        "recipient_relationship",
        "occasion",
        "gift_wrap",
        "scheduled_delivery_date",
    ]
    list_filter = ["occasion", "gift_wrap"]
    search_fields = ["recipient_name", "personal_message"]


@admin.register(GiftOrder)
class GiftOrderAdmin(ModelAdmin):
    list_display = [
        "id",
        "customer_name",
        "customer_email",
        "company",
        "total_items",
        "total_amount_ugx",
        "status",
        "updated_at",
    ]
    list_filter = ["status"]
    search_fields = ["customer_name", "customer_email", "company"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [GiftOrderItemInline]


@admin.register(GiftOrderItem)
class GiftOrderItemAdmin(ModelAdmin):
    list_display = [
        "id",
        "gift_order",
        "product",
        "quantity",
        "line_total_ugx",
        "created_at",
    ]
    search_fields = ["gift_order__id", "product__name"]
    readonly_fields = ["created_at"]
