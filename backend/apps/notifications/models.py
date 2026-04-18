from django.db import models


class NotificationEvent(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]

    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    order = models.ForeignKey(
        'orders.Order',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    event_type = models.CharField(max_length=50)
    recipient = models.CharField(max_length=255)
    payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.channel}:{self.event_type}:{self.recipient}'