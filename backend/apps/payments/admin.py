from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.payments.models import PaymentTransaction


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

