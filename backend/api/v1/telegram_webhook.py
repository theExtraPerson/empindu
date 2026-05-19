"""
Backward-compatible import for the Telegram webhook endpoint.
"""

from api.v1.telegram_handlers import process_update, telegram_webhook

__all__ = ["process_update", "telegram_webhook"]
