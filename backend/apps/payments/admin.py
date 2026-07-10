from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.payments.models import PaymentTransaction, Payout


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(ModelAdmin):
    list_display = [
        "reference",
        "order",
        "provider",
        "status",
        "amount_ugx",
        "created_at",
    ]
    list_filter = ["provider", "status", "currency"]
    search_fields = ["reference", "external_reference", "order__id"]
    readonly_fields = ["created_at", "updated_at", "completed_at", "response_payload"]


@admin.register(Payout)
class PayoutAdmin(ModelAdmin):
    list_display = [
        "id",
        "order",
        "artisan",
        "provider",
        "amount_ugx",
        "status",
        "to_account",
        "created_at",
    ]
    list_filter = ["provider", "status"]
    search_fields = ["order__id", "artisan__user__email", "to_account", "external_reference"]
    readonly_fields = ["created_at", "processed_at"]

