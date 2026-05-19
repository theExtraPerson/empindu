"""
Conversation state machines for Empindu Telegram flows.
"""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

from asgiref.sync import sync_to_async
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes, ConversationHandler

from .utils import (
    GiftPayload,
    artisan_url,
    create_checkout,
    create_artisan_from_telegram,
    create_listing_from_telegram,
    format_product,
    get_artisan_by_chat,
    gift_url,
    money,
    product_url,
    search_products,
    transcribe_audio,
)

GIFT_OCCASION, GIFT_RECIPIENT, GIFT_BUDGET, GIFT_RECOMMEND, GIFT_PHONE, GIFT_EMAIL = range(6)
LISTING_PHOTO, LISTING_NAME, LISTING_STORY, LISTING_PRICE, LISTING_CONFIRM = range(10, 15)
ONBOARD_NAME, ONBOARD_EMAIL, ONBOARD_PHONE, ONBOARD_CRAFT, ONBOARD_LOCATION, ONBOARD_EXPERIENCE, ONBOARD_BIO, ONBOARD_MOMO, ONBOARD_CONFIRM = range(20, 29)

CRAFT_OPTIONS = ["Basketry", "Bark cloth", "Wood work", "Tapestry", "Embroidery"]


def _gift_data(context: ContextTypes.DEFAULT_TYPE) -> dict:
    return context.user_data.setdefault("gift_flow", {})


async def gift_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["gift_flow"] = {}
    await update.effective_message.reply_text(
        "Gift concierge is open.\n\n"
        "What is the occasion? You can say birthday, wedding, thank you, graduation, or describe it naturally."
    )
    return GIFT_OCCASION


async def gift_collect_occasion(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _gift_data(context)["occasion"] = update.effective_message.text.strip()
    await update.effective_message.reply_text("Beautiful. Who is the recipient? Send their name.")
    return GIFT_RECIPIENT


async def gift_collect_recipient(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _gift_data(context)["recipient"] = update.effective_message.text.strip()
    await update.effective_message.reply_text("What budget should I stay under in USD? Example: 40")
    return GIFT_BUDGET


async def gift_collect_budget(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    try:
        budget = float(update.effective_message.text.strip())
    except ValueError:
        await update.effective_message.reply_text("Send just the number, for example `40`.", parse_mode="Markdown")
        return GIFT_BUDGET

    data = _gift_data(context)
    data["budget"] = budget
    products = await search_products(data.get("occasion", ""), limit=4, max_usd=budget)
    if not products:
        products = await search_products("", limit=4, max_usd=budget)

    if not products:
        await update.effective_message.reply_text(
            f"I did not find a product under USD {budget:.0f} yet. Continue on the web gift flow:\n{gift_url()}"
        )
        return ConversationHandler.END

    data["recommendations"] = [product.slug for product in products]
    await update.effective_message.reply_text(
        f"Gift ideas for {data.get('recipient')} ({data.get('occasion')}), under USD {budget:.0f}:"
    )

    for product in products:
        await update.effective_message.reply_text(
            format_product(product),
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(
                [
                    [InlineKeyboardButton("View", url=product_url(product))],
                    [InlineKeyboardButton(f"Choose {product.name[:22]}", callback_data=f"gift_pick:{product.slug}")],
                ]
            ),
            disable_web_page_preview=True,
        )

    await update.effective_message.reply_text("Tap a product above, or send the product slug you want.")
    return GIFT_RECOMMEND


async def gift_pick_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    if not query:
        return GIFT_RECOMMEND
    await query.answer()
    slug = query.data.split(":", 1)[1]
    _gift_data(context)["product_slug"] = slug
    await query.message.reply_text("Great choice. Send the mobile money phone number for payment.")
    return GIFT_PHONE


async def gift_collect_product(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    slug = update.effective_message.text.strip()
    _gift_data(context)["product_slug"] = slug
    await update.effective_message.reply_text("Great choice. Send the mobile money phone number for payment.")
    return GIFT_PHONE


async def gift_collect_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _gift_data(context)["phone"] = update.effective_message.text.strip()
    await update.effective_message.reply_text("Send the buyer email for the receipt.")
    return GIFT_EMAIL


async def gift_collect_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    data = _gift_data(context)
    email = update.effective_message.text.strip()
    user = update.effective_user
    buyer_name = user.full_name if user else "Telegram buyer"
    gift = GiftPayload(
        recipient_name=data.get("recipient", "Recipient"),
        occasion=data.get("occasion", "Gift"),
        personal_message=f"A meaningful Empindu gift for {data.get('recipient', 'you')}.",
    )

    try:
        order, payment = await create_checkout(
            product_slug=data["product_slug"],
            phone=data["phone"],
            email=email,
            buyer_name=buyer_name,
            chat_id=update.effective_chat.id if update.effective_chat else None,
            gift=gift,
        )
    except Exception as exc:
        await update.effective_message.reply_text(f"I could not create that gift order: {exc}")
        return ConversationHandler.END

    await update.effective_message.reply_text(
        f"Gift order #{order.id} is ready.\n"
        f"Amount: {money(order.price_ugx)}\n"
        f"Payment reference: `{payment.reference}`",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton(f"Pay {money(order.price_ugx)}", url=payment.checkout_url)]]),
        disable_web_page_preview=True,
    )
    context.user_data.pop("gift_flow", None)
    return ConversationHandler.END


async def cancel_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.pop("gift_flow", None)
    context.user_data.pop("listing_flow", None)
    context.user_data.pop("artisan_onboarding_flow", None)
    await update.effective_message.reply_text("Cancelled. Use /start whenever you want to continue.")
    return ConversationHandler.END


def _listing_data(context: ContextTypes.DEFAULT_TYPE) -> dict:
    return context.user_data.setdefault("listing_flow", {})


def _onboard_data(context: ContextTypes.DEFAULT_TYPE) -> dict:
    return context.user_data.setdefault("artisan_onboarding_flow", {})


async def onboard_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    existing = await get_artisan_by_chat(update.effective_chat.id)
    if existing:
        await update.effective_message.reply_text(
            f"Your artisan profile is already linked: {artisan_url(existing)}",
            disable_web_page_preview=True,
        )
        return ConversationHandler.END

    user = update.effective_user
    context.user_data["artisan_onboarding_flow"] = {
        "full_name": user.full_name if user else "",
        "telegram_user_id": user.id if user else None,
    }
    await update.effective_message.reply_text(
        "Let's create your Empindu artisan profile.\n\n"
        "First, send your full name as buyers should see it."
    )
    return ONBOARD_NAME


async def onboard_collect_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _onboard_data(context)["full_name"] = update.effective_message.text.strip()
    await update.effective_message.reply_text(
        "Send an email for receipts and dashboard access.\n"
        "If you do not use email, send `skip` and I will create a Telegram-only account.",
        parse_mode="Markdown",
    )
    return ONBOARD_EMAIL


async def onboard_collect_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.effective_message.text.strip()
    _onboard_data(context)["email"] = "" if text.lower() == "skip" else text
    await update.effective_message.reply_text("Send your WhatsApp or phone number. Example: +256700000000")
    return ONBOARD_PHONE


async def onboard_collect_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _onboard_data(context)["phone"] = update.effective_message.text.strip()
    keyboard = InlineKeyboardMarkup(
        [[InlineKeyboardButton(craft, callback_data=f"onboard_craft:{craft}")] for craft in CRAFT_OPTIONS]
    )
    await update.effective_message.reply_text(
        "Choose your main craft tradition, or type another one.",
        reply_markup=keyboard,
    )
    return ONBOARD_CRAFT


async def onboard_collect_craft_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    if not query:
        return ONBOARD_CRAFT
    await query.answer()
    craft = query.data.split(":", 1)[1]
    _onboard_data(context)["craft_name"] = craft
    await query.message.reply_text("Where are you based? Send `community, district`. Example: Kasubi, Kampala")
    return ONBOARD_LOCATION


async def onboard_collect_craft_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _onboard_data(context)["craft_name"] = update.effective_message.text.strip()
    await update.effective_message.reply_text("Where are you based? Send `community, district`. Example: Kasubi, Kampala", parse_mode="Markdown")
    return ONBOARD_LOCATION


async def onboard_collect_location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    parts = [part.strip() for part in update.effective_message.text.split(",", 1)]
    data = _onboard_data(context)
    data["community"] = parts[0]
    data["district"] = parts[1] if len(parts) > 1 else ""
    await update.effective_message.reply_text("How many years have you practiced this craft? Send a number, or `0`.")
    return ONBOARD_EXPERIENCE


async def onboard_collect_experience(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    try:
        years = int(update.effective_message.text.strip())
    except ValueError:
        await update.effective_message.reply_text("Send the number of years, for example `6`.", parse_mode="Markdown")
        return ONBOARD_EXPERIENCE

    _onboard_data(context)["years_experience"] = max(0, years)
    await update.effective_message.reply_text(
        "Now send your artisan story. You can type it or send a voice note.\n"
        "Tell buyers what you make, where the knowledge comes from, and what makes the work meaningful."
    )
    return ONBOARD_BIO


async def onboard_collect_bio(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    bio = update.effective_message.text or ""
    if update.effective_message.voice:
        voice = update.effective_message.voice
        file = await context.bot.get_file(voice.file_id)
        voice_bytes = bytes(await file.download_as_bytearray())
        bio = await sync_to_async(transcribe_audio)(voice_bytes, f"telegram-onboard-{voice.file_unique_id}.ogg")
        if not bio:
            await update.effective_message.reply_text("I received the voice note, but transcription is not configured yet. Please type your story.")
            return ONBOARD_BIO

    _onboard_data(context)["bio"] = bio.strip()
    await update.effective_message.reply_text("Send your MTN MoMo number for payouts, or `skip`.")
    return ONBOARD_MOMO


async def onboard_collect_momo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.effective_message.text.strip()
    data = _onboard_data(context)
    data["momo_number"] = "" if text.lower() == "skip" else text
    await update.effective_message.reply_text(
        f"Ready to create your artisan profile:\n\n"
        f"*{data.get('full_name')}*\n"
        f"Craft: {data.get('craft_name')}\n"
        f"Place: {data.get('community')}, {data.get('district')}\n"
        f"Experience: {data.get('years_experience', 0)} years\n\n"
        "Send `publish` to create it, or /cancel.",
        parse_mode="Markdown",
    )
    return ONBOARD_CONFIRM


async def onboard_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    if update.effective_message.text.strip().lower() != "publish":
        await update.effective_message.reply_text("Send `publish` to create the artisan profile, or /cancel.", parse_mode="Markdown")
        return ONBOARD_CONFIRM

    data = _onboard_data(context)
    try:
        artisan = await create_artisan_from_telegram(
            chat_id=update.effective_chat.id,
            telegram_user_id=data.get("telegram_user_id"),
            full_name=data["full_name"],
            email=data.get("email", ""),
            phone=data["phone"],
            craft_name=data["craft_name"],
            community=data["community"],
            district=data.get("district", ""),
            bio=data["bio"],
            momo_number=data.get("momo_number", ""),
            years_experience=data.get("years_experience", 0),
        )
    except Exception as exc:
        await update.effective_message.reply_text(f"I could not create the artisan profile: {exc}")
        return ConversationHandler.END

    context.user_data.pop("artisan_onboarding_flow", None)
    await update.effective_message.reply_text(
        f"Your artisan profile is live for review: {artisan_url(artisan)}\n\n"
        "Next, use /newlisting to add your first product with a photo and story.",
        disable_web_page_preview=True,
    )
    return ConversationHandler.END


async def newlisting_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    artisan = await get_artisan_by_chat(update.effective_chat.id)
    if not artisan:
        await update.effective_message.reply_text(
            "I could not find an artisan profile linked to this Telegram account yet.\n"
            "Use /onboard to create one now, then try /newlisting again."
        )
        return ConversationHandler.END

    context.user_data["listing_flow"] = {}
    await update.effective_message.reply_text(
        f"New listing for {artisan.full_name}.\n\n"
        "First, send one product photo."
    )
    return LISTING_PHOTO


async def listing_collect_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    if not update.effective_message.photo:
        await update.effective_message.reply_text("Please send a product photo.")
        return LISTING_PHOTO

    photo = update.effective_message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    image_bytes = await file.download_as_bytearray()
    data = _listing_data(context)
    data["photo_bytes"] = bytes(image_bytes)
    data["photo_name"] = f"telegram-{photo.file_unique_id}.jpg"
    await update.effective_message.reply_text("Photo received. What is the product name?")
    return LISTING_NAME


async def listing_collect_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    _listing_data(context)["name"] = update.effective_message.text.strip()
    await update.effective_message.reply_text(
        "Now send a voice note telling the product story. You can also type the description instead."
    )
    return LISTING_STORY


async def listing_collect_story(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    data = _listing_data(context)
    story = update.effective_message.text or ""

    if update.effective_message.voice:
        voice = update.effective_message.voice
        file = await context.bot.get_file(voice.file_id)
        voice_bytes = bytes(await file.download_as_bytearray())
        story = await sync_to_async(transcribe_audio)(voice_bytes, f"telegram-{voice.file_unique_id}.ogg")
        if not story:
            await update.effective_message.reply_text(
                "I received the voice note, but transcription is not configured yet. Please type the product story for now."
            )
            return LISTING_STORY

    data["story"] = story.strip()
    await update.effective_message.reply_text("What price should we list it at in UGX? Example: 85000")
    return LISTING_PRICE


async def listing_collect_price(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    try:
        price = Decimal(update.effective_message.text.strip().replace(",", ""))
    except (InvalidOperation, AttributeError):
        await update.effective_message.reply_text("Send the price as a number in UGX, for example `85000`.", parse_mode="Markdown")
        return LISTING_PRICE

    data = _listing_data(context)
    data["price_ugx"] = str(price)
    await update.effective_message.reply_text(
        f"Ready to create draft listing:\n\n"
        f"*{data.get('name')}*\n"
        f"{money(price)}\n\n"
        f"{data.get('story')}\n\n"
        "Send `publish` to create it as a draft, or /cancel.",
        parse_mode="Markdown",
    )
    return LISTING_CONFIRM


async def listing_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    if update.effective_message.text.strip().lower() != "publish":
        await update.effective_message.reply_text("Send `publish` to create the draft listing, or /cancel.", parse_mode="Markdown")
        return LISTING_CONFIRM

    data = _listing_data(context)
    try:
        product = await create_listing_from_telegram(
            chat_id=update.effective_chat.id,
            name=data["name"],
            price_ugx=Decimal(data["price_ugx"]),
            story=data["story"],
            photo_bytes=data.get("photo_bytes"),
            photo_name=data.get("photo_name", "telegram-product.jpg"),
        )
    except Exception as exc:
        await update.effective_message.reply_text(f"I could not create that listing: {exc}")
        return ConversationHandler.END

    context.user_data.pop("listing_flow", None)
    await update.effective_message.reply_text(
        f"Draft listing created: *{product.name}*\n"
        f"Slug: `{product.slug}`\n\n"
        "It is saved as a draft for admin/artisan review before going live.",
        parse_mode="Markdown",
    )
    return ConversationHandler.END
