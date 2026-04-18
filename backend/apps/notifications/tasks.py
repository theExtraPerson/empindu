from celery import shared_task
from django.utils import timezone

from apps.notifications.models import NotificationEvent
from apps.orders.models import Order


@shared_task
def queue_order_notification(order_id: int, event_type: str):
    order = Order.objects.get(pk=order_id)
    recipient = order.buyer_email or 'operations@empindu.local'
    event = NotificationEvent.objects.create(
        order=order,
        channel='email',
        event_type=event_type,
        recipient=recipient,
        payload={
            'order_id': order.id,
            'status': order.status,
            'artisan': order.artisan.full_name,
            'product': order.product.name,
        },
    )
    event.status = 'sent'
    event.sent_at = timezone.now()
    event.save(update_fields=['status', 'sent_at'])
    return event.id