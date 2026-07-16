"""
Command, callback, and inline-query handlers for Empindu Telegram.
"""

from __future__ import annotations

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InlineQueryResultArticle,
    InputTextMessageContent,
    ReplyKeyboardMarkup,
    Update,
)
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    InlineQueryHandler,
    MessageHandler,
    filters,
)

from .conversations import (
    GIFT_BUDGET,
    GIFT_EMAIL,
    GIFT_OCCASION,
    GIFT_PHONE,
    GIFT_RECIPIENT,
    GIFT_RECOMMEND,
    LISTING_CONFIRM,
    LISTING_NAME,
    LISTING_PHOTO,
    LISTING_PRICE,
    LISTING_STORY,
    ONBOARD_BIO,
    ONBOARD_CONFIRM,
    ONBOARD_CRAFT,
    ONBOARD_EMAIL,
    ONBOARD_EXPERIENCE,
    ONBOARD_LOCATION,
    ONBOARD_MOMO,
    ONBOARD_NAME,
    ONBOARD_PHONE,
    cancel_conversation,
    gift_collect_budget,
    gift_collect_email,
    gift_collect_occasion,
    gift_collect_phone,
    gift_collect_product,
    gift_collect_recipient,
    gift_pick_callback,
    gift_start,
    listing_collect_name,
    listing_collect_photo,
    listing_collect_price,
    listing_collect_story,
    listing_confirm,
    newlisting_start,
    onboard_collect_bio,
    onboard_collect_craft_callback,
    onboard_collect_craft_text,
    onboard_collect_email,
    onboard_collect_experience,
    onboard_collect_location,
    onboard_collect_momo,
    onboard_collect_name,
    onboard_collect_phone,
    onboard_confirm,
    onboard_start,
)
from .utils import (
    artisan_earnings,
    artisan_url,
    buyer_orders,
    create_checkout,
    create_payout_request,
    format_artisan,
    format_product,
    get_artisan_by_name_or_slug,
    get_order,
    get_order_for_requester,

    get_product,
    gift_url,
    initiate_order_payment,
    money,
    product_url,
    search_artisans,
    search_products,
)


def main_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        [
            ["Buy", "Artisan"],
            ["Send Gift", "Help"],
        ],
        resize_keyboard=True,
    )


def product_keyboard(product) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton("View product", url=product_url(product)),
                InlineKeyboardButton("Send as gift", url=gift_url(product)),
            ],
            [InlineKeyboardButton(f"Pay {money(product.price_ugx)}", callback_data=f"pay_product:{product.slug}")],
        ]
    )


def artisan_keyboard(artisan) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[InlineKeyboardButton("Open profile", url=artisan_url(artisan))]])


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.effective_message.reply_text(
        "*Empindu*\n"
        "Thrive with Nature.\n\n"
        "Buy meaningful craft, send gifts, or manage artisan listings from Telegram.",
        parse_mode="Markdown",
        reply_markup=main_keyboard(),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.effective_message.reply_text(
        "*Command menu*\n\n"
        "`/start` - Welcome and quick actions\n"
        "`/shop [query]` - Browse products by craft, material, place, or term\n"
        "`/gift` - Guided gift concierge\n"
        "`/search [term]` - Natural language product search\n"
        "`/artisan [name]` - Artisan profile card\n"
        "`/track [order_id]` - Order status and tracking\n"
        "`/myorders [email]` - Buyer purchase history\n"
        "`/onboard` - Create an artisan profile conversationally\n"
        "`/newlisting` - Artisan product upload with photo and voice/text story\n"
        "`/earnings` - Artisan earnings summary\n"
        "`/payout` - Request payout to MoMo\n"
        "`/help` - This menu\n\n"
        "Inline mode: type `@EmpinduBot basket` in any chat after enabling inline mode with BotFather.",
        parse_mode="Markdown",
    )


async def shop_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = " ".join(context.args).strip()
    products = await search_products(query, limit=6)
    if not products:
        await update.effective_message.reply_text("No matching active products yet. Try `/shop basket` or `/shop pottery`.")
        return

    heading = f"Products for '{query}':" if query else "Fresh from Empindu:"
    await update.effective_message.reply_text(heading)
    for product in products:
        await update.effective_message.reply_text(
            format_product(product),
            parse_mode="Markdown",
            reply_markup=product_keyboard(product),
            disable_web_page_preview=True,
        )


async def search_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    term = " ".join(context.args).strip()
    if not term:
        await update.effective_message.reply_text("Send `/search woven wedding gift` or any phrase you have in mind.", parse_mode="Markdown")
        return
    await shop_command(update, context)


async def artisan_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    term = " ".join(context.args).strip()
    if not term:
        artisans = await search_artisans("", limit=5)
    else:
        artisan = await get_artisan_by_name_or_slug(term)
        artisans = [artisan] if artisan else await search_artisans(term, limit=5)

    if not artisans:
        await update.effective_message.reply_text("No artisan matched that search yet.")
        return

    for artisan in artisans:
        await update.effective_message.reply_text(
            format_artisan(artisan),
            parse_mode="Markdown",
            reply_markup=artisan_keyboard(artisan),
            disable_web_page_preview=True,
        )


async def track_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not context.args:
        await update.effective_message.reply_text("Send `/track 1234` with your order ID.", parse_mode="Markdown")
        return
    try:
        order_id = int(context.args[0])
    except ValueError:
        await update.effective_message.reply_text("Order ID must be a number.")
        return

    order = await get_order(order_id)
    if not order:
        await update.effective_message.reply_text("I could not find that order.")
        return

    await update.effective_message.reply_text(
        f"*Order #{order.id}*\n"
        f"{order.product.name}\n"
        f"Status: `{order.status}`\n"
        f"Payment reference: `{order.payment_reference or 'pending'}`\n"
        f"Tracking: {order.tracking_number or 'Not dispatched yet'}",
        parse_mode="Markdown",
    )


async def myorders_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    email = context.args[0].strip() if context.args else context.user_data.get("buyer_email", "")
    orders = await buyer_orders(chat_id=update.effective_chat.id, email=email)
    if not orders:
        await update.effective_message.reply_text(
            "No orders found yet. If you checked out with email, try `/myorders buyer@example.com`.",
            parse_mode="Markdown",
        )
        return

    for order in orders:
        await update.effective_message.reply_text(
            f"*Order #{order.id}* - {order.product.name}\n"
            f"{money(order.price_ugx)}\n"
            f"Status: `{order.status}`\n"
            f"Tracking: {order.tracking_number or 'Not dispatched yet'}",
            parse_mode="Markdown",
        )


async def checkout_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if len(context.args) < 3:
        await update.effective_message.reply_text(
            "Send `/checkout <product-slug> <phone> <email> [country]`.\n"
            "Example: `/checkout woven-basket +256700000000 buyer@example.com UG`",
            parse_mode="Markdown",
        )
        return

    product_slug, phone, email = context.args[:3]
    country = context.args[3].upper() if len(context.args) > 3 else "UG"
    buyer_name = update.effective_user.full_name if update.effective_user else "Telegram buyer"

    try:
        order, payment = await create_checkout(
            product_slug=product_slug,
            phone=phone,
            email=email,
            buyer_name=buyer_name,
            country=country,
            chat_id=update.effective_chat.id,
        )
    except Exception as exc:
        await update.effective_message.reply_text(f"Checkout failed: {exc}")
        return

    context.user_data["buyer_email"] = email
    await update.effective_message.reply_text(
        f"Order #{order.id} created for *{order.product.name}*.\n"
        f"Amount: {money(order.price_ugx)}\n"
        f"Reference: `{payment.reference}`",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton(f"Pay {money(order.price_ugx)}", url=payment.checkout_url)]]),
        disable_web_page_preview=True,
    )


async def pay_product_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not query:
        return
    await query.answer()
    product_slug = query.data.split(":", 1)[1]
    product = await get_product(product_slug)
    if not product:
        await query.message.reply_text("That product is no longer available.")
        return
    await query.message.reply_text(
        "To create the order and receive a payment link, send:\n"
        f"`/checkout {product.slug} +256700000000 buyer@example.com UG`",
        parse_mode="Markdown",
    )


async def pay_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if len(context.args) < 2:
        await update.effective_message.reply_text("Send `/pay <order_id> <phone>`.", parse_mode="Markdown")
        return
    try:
        order_id = int(context.args[0])
        order, payment = await initiate_order_payment(order_id, context.args[1])
    except Exception as exc:
        await update.effective_message.reply_text(f"Payment could not be started: {exc}")
        return

    await update.effective_message.reply_text(
        f"Payment link for order #{order.id}.",
        reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton(f"Pay {money(payment.amount_ugx)}", url=payment.checkout_url)]]),
    )


async def earnings_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = await artisan_earnings(update.effective_chat.id)
    artisan = data.get("artisan")
    if not artisan:
        await update.effective_message.reply_text("No artisan profile is linked to this Telegram account yet.")
        return
    await update.effective_message.reply_text(
        f"*{artisan.full_name} earnings*\n"
        f"Paid out: {money(data['paid_total'])}\n"
        f"Pending balance: {money(data['pending_total'])}\n"
        f"Orders: {data['orders']}",
        parse_mode="Markdown",
    )


async def payout_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = await create_payout_request(update.effective_chat.id)
    artisan = data.get("artisan")
    if not artisan:
        await update.effective_message.reply_text("No artisan profile is linked to this Telegram account yet.")
        return
    await update.effective_message.reply_text(
        f"Payout request prepared for *{artisan.full_name}*.\n"
        f"Reference: `{data['reference']}`\n"
        f"MoMo: `{data['momo']}`\n"
        f"Amount pending: {money(data['pending_total'])}\n\n"
        "Operations can now approve and process this payout.",
        parse_mode="Markdown",
    )


async def inline_query_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.inline_query.query.strip()
    products = await search_products(query, limit=10)
    results = []
    for product in products:
        photo = product.photos.first()
        results.append(
            InlineQueryResultArticle(
                id=f"product-{product.id}",
                title=product.name,
                description=f"{money(product.price_ugx)} - {product.artisan.full_name}",
                thumbnail_url=photo.image.url if photo else None,
                input_message_content=InputTextMessageContent(
                    f"{format_product(product)}\n\n{product_url(product)}",
                    parse_mode="Markdown",
                    disable_web_page_preview=False,
                ),
                reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Open product", url=product_url(product))]]),
            )
        )
    await update.inline_query.answer(results, cache_time=60, is_personal=False)


async def text_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (update.effective_message.text or "").strip().lower()
    if text == "buy":
        await shop_command(update, context)
    elif text == "artisan":
        await update.effective_message.reply_text(
            "Artisan tools:\n"
            "/onboard - create your artisan profile\n"
            "/newlisting - add a product\n"
            "/earnings - check earnings\n"
            "/payout - prepare payout request"
        )
    elif text == "send gift":
        await gift_start(update, context)
    elif text == "help":
        await help_command(update, context)


def setup_handlers(app: Application) -> None:
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("shop", shop_command))
    app.add_handler(CommandHandler("search", search_command))
    app.add_handler(CommandHandler("artisan", artisan_command))
    app.add_handler(CommandHandler("track", track_command))
    app.add_handler(CommandHandler("myorders", myorders_command))
    app.add_handler(CommandHandler("checkout", checkout_command))
    app.add_handler(CommandHandler("pay", pay_command))
    app.add_handler(CommandHandler("earnings", earnings_command))
    app.add_handler(CommandHandler("payout", payout_command))
    app.add_handler(CallbackQueryHandler(pay_product_callback, pattern=r"^pay_product:"))

    app.add_handler(
        ConversationHandler(
            entry_points=[CommandHandler("onboard", onboard_start)],
            states={
                ONBOARD_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_name)],
                ONBOARD_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_email)],
                ONBOARD_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_phone)],
                ONBOARD_CRAFT: [
                    CallbackQueryHandler(onboard_collect_craft_callback, pattern=r"^onboard_craft:"),
                    MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_craft_text),
                ],
                ONBOARD_LOCATION: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_location)],
                ONBOARD_EXPERIENCE: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_experience)],
                ONBOARD_BIO: [
                    MessageHandler(filters.VOICE, onboard_collect_bio),
                    MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_bio),
                ],
                ONBOARD_MOMO: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_collect_momo)],
                ONBOARD_CONFIRM: [MessageHandler(filters.TEXT & ~filters.COMMAND, onboard_confirm)],
            },
            fallbacks=[CommandHandler("cancel", cancel_conversation)],
            conversation_timeout=1200,
        )
    )

    app.add_handler(
        ConversationHandler(
            entry_points=[
                CommandHandler("gift", gift_start),
                MessageHandler(filters.Regex(r"^Send Gift$"), gift_start),
            ],
            states={
                GIFT_OCCASION: [MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_occasion)],
                GIFT_RECIPIENT: [MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_recipient)],
                GIFT_BUDGET: [MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_budget)],
                GIFT_RECOMMEND: [
                    CallbackQueryHandler(gift_pick_callback, pattern=r"^gift_pick:"),
                    MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_product),
                ],
                GIFT_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_phone)],
                GIFT_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, gift_collect_email)],
            },
            fallbacks=[CommandHandler("cancel", cancel_conversation)],
            conversation_timeout=600,
            per_message=False,
        )
    )

    app.add_handler(
        ConversationHandler(
            entry_points=[CommandHandler("newlisting", newlisting_start)],
            states={
                LISTING_PHOTO: [MessageHandler(filters.PHOTO, listing_collect_photo)],
                LISTING_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, listing_collect_name)],
                LISTING_STORY: [
                    MessageHandler(filters.VOICE, listing_collect_story),
                    MessageHandler(filters.TEXT & ~filters.COMMAND, listing_collect_story),
                ],
                LISTING_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, listing_collect_price)],
                LISTING_CONFIRM: [MessageHandler(filters.TEXT & ~filters.COMMAND, listing_confirm)],
            },
            fallbacks=[CommandHandler("cancel", cancel_conversation)],
            conversation_timeout=900,
        )
    )

    app.add_handler(InlineQueryHandler(inline_query_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_menu_handler))
