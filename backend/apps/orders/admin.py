from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.orders.models import Order, ReturnRequest


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = [
        "id",
        "product",
        "artisan",
        "buyer_email",
        "status",
        "payment_method",
        "price_ugx",
        "created_at",
    ]
    list_filter = ["status", "payment_method", "shipping_country", "payout_status"]
    search_fields = [
        "id",
        "product__name",
        "artisan__user__first_name",
        "buyer_email",
        "payment_reference",
        "tracking_number",
    ]
    readonly_fields = [
        "price_ugx",
        "price_usd",
        "artisan_earnings_ugx",
        "platform_commission_ugx",
        "heritage_fund_ugx",
        "created_at",
        "paid_at",
        "dispatched_at",
        "delivered_at",
    ]


@admin.register(ReturnRequest)
class ReturnRequestAdmin(ModelAdmin):
    list_display = [
        "id",
        "order",
        "reason",
        "status",
        "refund_amount_ugx",
        "created_at",
    ]
    list_filter = ["status", "reason"]
    search_fields = ["order__id", "details"]
    readonly_fields = ["created_at", "reviewed_at", "completed_at"]

