"""
Telegram webhook endpoint for Empindu bot updates.
"""

from __future__ import annotations

import asyncio
import json
import logging

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from telegram import Update

from apps.telegram_bot.bot import get_bot_application

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def telegram_webhook(request):
    secret = getattr(settings, "TELEGRAM_WEBHOOK_SECRET", "")
    if secret and request.headers.get("X-Telegram-Bot-Api-Secret-Token") != secret:
        return JsonResponse({"error": "invalid webhook secret"}, status=403)

    try:
        update_data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid json"}, status=400)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_update(update_data))
    except Exception as exc:
        logger.exception("Telegram webhook processing failed")
        return JsonResponse({"error": str(exc)}, status=400)
    finally:
        loop.close()

    return JsonResponse({"status": "ok"})


async def process_update(update_data: dict) -> None:
    app = get_bot_application()
    if not getattr(app, "_initialized", False):
        await app.initialize()
    update = Update.de_json(update_data, app.bot)
    await app.process_update(update)
