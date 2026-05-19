"""
Small, optional Telegram announcements for shareable marketplace moments.
"""

from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


def send_telegram_announcement(text: str) -> None:
    token = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
    chat_id = getattr(settings, "TELEGRAM_ANNOUNCEMENT_CHAT_ID", "")
    if not token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps(
        {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False,
        }
    ).encode("utf-8")

    try:
        request = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(request, timeout=4).read()
    except Exception as exc:  # pragma: no cover - external best-effort notification
        logger.warning("Telegram announcement failed: %s", exc)


def telegram_share_url(url: str, text: str) -> str:
    return "https://t.me/share/url?" + urllib.parse.urlencode({"url": url, "text": text})
