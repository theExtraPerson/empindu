"""
Telegram application factory for Empindu.
"""

from __future__ import annotations

import logging

from django.conf import settings
from telegram.ext import Application

from .handlers import setup_handlers

logger = logging.getLogger(__name__)

TELEGRAM_WEBHOOK_PATH = "/api/v1/telegram/webhook/"

_application: Application | None = None


def get_bot_application() -> Application:
    global _application
    if _application is not None:
        return _application

    if not settings.TELEGRAM_BOT_TOKEN:
        raise ValueError("TELEGRAM_BOT_TOKEN is not set")

    _application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
    setup_handlers(_application)
    logger.info("Empindu Telegram bot application initialized")
    return _application
