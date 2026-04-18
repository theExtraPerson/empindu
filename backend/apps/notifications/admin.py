from django.contrib import admin
from unfold.admin import ModelAdmin

from apps.notifications.models import NotificationEvent


@admin.register(NotificationEvent)
class NotificationEventAdmin(ModelAdmin):
    list_display = [
        'id',
        'event_type',
        'channel',
        'recipient',
        'status',
        'created_at',
        'sent_at',
    ]
    list_filter = ['channel', 'status', 'event_type']
    search_fields = ['recipient', 'event_type', 'order__id']
    readonly_fields = ['created_at', 'sent_at', 'payload']
