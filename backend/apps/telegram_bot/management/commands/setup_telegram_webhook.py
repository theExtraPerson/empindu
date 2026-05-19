"""
Configure the Empindu Telegram webhook from Django.
"""

from __future__ import annotations

import asyncio

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from telegram import Bot

from apps.telegram_bot.bot import TELEGRAM_WEBHOOK_PATH


class Command(BaseCommand):
    help = "Set the Telegram webhook for the Empindu bot."

    def add_arguments(self, parser):
        parser.add_argument(
            "--url",
            help="Public HTTPS base URL or full webhook URL. Defaults to TELEGRAM_WEBHOOK_URL.",
        )
        parser.add_argument(
            "--drop-pending-updates",
            action="store_true",
            help="Drop queued Telegram updates when setting the webhook.",
        )

    def handle(self, *args, **options):
        token = settings.TELEGRAM_BOT_TOKEN
        if not token:
            raise CommandError("TELEGRAM_BOT_TOKEN is not set.")

        raw_url = (options["url"] or settings.TELEGRAM_WEBHOOK_URL or "").rstrip("/")
        if not raw_url:
            raise CommandError("Provide --url or set TELEGRAM_WEBHOOK_URL.")
        if not raw_url.startswith("https://"):
            raise CommandError("Telegram webhooks require a public HTTPS URL.")

        webhook_url = raw_url if raw_url.endswith(TELEGRAM_WEBHOOK_PATH.rstrip("/")) else f"{raw_url}{TELEGRAM_WEBHOOK_PATH}"
        drop_pending_updates = bool(options["drop_pending_updates"])

        async def configure():
            bot = Bot(token)
            kwargs = {
                "url": webhook_url,
                "drop_pending_updates": drop_pending_updates,
                "allowed_updates": ["message", "callback_query", "inline_query"],
            }
            if settings.TELEGRAM_WEBHOOK_SECRET:
                kwargs["secret_token"] = settings.TELEGRAM_WEBHOOK_SECRET
            await bot.set_webhook(**kwargs)
            return await bot.get_webhook_info()

        info = asyncio.run(configure())
        self.stdout.write(self.style.SUCCESS(f"Telegram webhook set: {info.url}"))
        self.stdout.write(f"Pending updates: {info.pending_update_count}")
