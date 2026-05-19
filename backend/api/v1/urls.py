"""
URLs for API v1
"""
from django.urls import path
from api.v1.router import api
from api.v1.telegram_handlers import telegram_webhook

urlpatterns = [
    path("", api.urls),
    # Telegram webhook (no authentication required)
    path("telegram/webhook/", telegram_webhook, name="telegram_webhook"),
]
