"""
Utilities for Telegram handlers.
"""

from __future__ import annotations

from decimal import Decimal
from io import BytesIO
from types import SimpleNamespace
from uuid import uuid4

from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models import Q, Sum
from django.utils import timezone
from django.utils.text import Truncator, slugify

from apps.accounts.models import UserProfile
from apps.artisans.models import Artisan, CraftTradition
from apps.orders.models import Order
from apps.orders.services import create_order_from_payload
from apps.payments.services import initiate_payment_for_order
from apps.products.models import Product, ProductPhoto, ProvenanceRecord
from apps.telegram_bot.announcements import send_telegram_announcement

User = get_user_model()


def money(value) -> str:
    return f"UGX {int(Decimal(value or 0)):,}"


def frontend_url(path: str = "") -> str:
    base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    return f"{base}{path}"


def product_url(product: Product) -> str:
    return frontend_url(f"/marketplace/{product.slug}")


def artisan_url(artisan: Artisan) -> str:
    return frontend_url(f"/artisans/{artisan.slug}")


def gift_url(product: Product | None = None) -> str:
    suffix = f"?product={product.slug}" if product else ""
    return frontend_url(f"/gift-checkout{suffix}")


def payment_url(order: Order, reference: str) -> str:
    return frontend_url(f"/checkout?order={order.id}&reference={reference}")


def format_product(product: Product) -> str:
    return (
        f"*{product.name}*\n"
        f"{money(product.price_ugx)} / USD {product.price_usd}\n"
        f"By {product.artisan.full_name} - {product.artisan.district}\n"
        f"Stock: {product.stock}\n\n"
        f"{Truncator(product.story).chars(180)}"
    )


def format_artisan(artisan: Artisan) -> str:
    certified = "Empindu Certified" if artisan.is_certified else "Community verified"
    return (
        f"*{artisan.full_name}*\n"
        f"{certified} {artisan.craft_tradition.name} artisan\n"
        f"{artisan.community}, {artisan.district}\n"
        f"{artisan.years_experience} years of experience\n\n"
        f"{Truncator(artisan.bio).chars(220)}"
    )


class AddressPayload:
    def __init__(self, line1: str, country: str):
        self.line1 = line1
        self.city = ""
        self.country = country
        self.postcode = ""
        self.notes = "Created from Telegram"

    def dict(self) -> dict:
        return {
            "line1": self.line1,
            "city": self.city,
            "country": self.country,
            "postcode": self.postcode,
            "notes": self.notes,
        }


class GiftPayload:
    def __init__(self, recipient_name: str, occasion: str, personal_message: str):
        self.recipient_name = recipient_name
        self.recipient_relationship = "Telegram recipient"
        self.occasion = occasion
        self.personal_message = personal_message
        self.gift_wrap = True
        self.scheduled_delivery_date = None


@sync_to_async
def search_products(term: str = "", *, limit: int = 8, max_usd: float | None = None) -> list[Product]:
    qs = (
        Product.objects.filter(status="active", stock__gt=0)
        .select_related("artisan", "artisan__user", "artisan__craft_tradition")
        .prefetch_related("photos")
        .order_by("-created_at")
    )
    if term:
        qs = qs.filter(
            Q(name__icontains=term)
            | Q(story__icontains=term)
            | Q(material__icontains=term)
            | Q(technique__icontains=term)
            | Q(craft_tradition__name__icontains=term)
            | Q(artisan__user__first_name__icontains=term)
            | Q(artisan__user__last_name__icontains=term)
            | Q(artisan__community__icontains=term)
            | Q(artisan__district__icontains=term)
        )
    if max_usd is not None:
        qs = qs.filter(price_usd__lte=max_usd)
    return list(qs[:limit])


@sync_to_async
def get_product(slug: str) -> Product | None:
    return (
        Product.objects.filter(slug=slug, status="active")
        .select_related("artisan", "artisan__user", "artisan__craft_tradition")
        .prefetch_related("photos")
        .first()
    )


@sync_to_async
def search_artisans(term: str = "", *, limit: int = 6) -> list[Artisan]:
    qs = Artisan.objects.filter(is_active=True).select_related("user", "craft_tradition")
    if term:
        qs = qs.filter(
            Q(user__first_name__icontains=term)
            | Q(user__last_name__icontains=term)
            | Q(user__username__icontains=term)
            | Q(bio__icontains=term)
            | Q(community__icontains=term)
            | Q(district__icontains=term)
            | Q(craft_tradition__name__icontains=term)
        )
    return list(qs.order_by("-is_certified", "-created_at")[:limit])


@sync_to_async
def get_artisan_by_name_or_slug(term: str) -> Artisan | None:
    return (
        Artisan.objects.filter(is_active=True)
        .select_related("user", "craft_tradition")
        .filter(
            Q(slug__iexact=term)
            | Q(user__username__iexact=term)
            | Q(user__first_name__icontains=term)
            | Q(user__last_name__icontains=term)
        )
        .first()
    )


@sync_to_async
def get_artisan_by_chat(chat_id: int) -> Artisan | None:
    return Artisan.objects.filter(telegram_chat_id=chat_id, is_active=True).select_related("user", "craft_tradition").first()


@sync_to_async
def create_artisan_from_telegram(
    *,
    chat_id: int,
    telegram_user_id: int | None,
    full_name: str,
    email: str,
    phone: str,
    craft_name: str,
    community: str,
    district: str,
    bio: str,
    momo_number: str = "",
    years_experience: int = 0,
) -> Artisan:
    existing = Artisan.objects.filter(telegram_chat_id=chat_id).select_related("user", "craft_tradition").first()
    if existing:
        return existing

    safe_email = (email or "").strip().lower()
    if not safe_email:
        safe_email = f"telegram_{telegram_user_id or chat_id}@telegram.empindu.local"

    name_parts = full_name.strip().split(maxsplit=1)
    first_name = name_parts[0] if name_parts else "Telegram"
    last_name = name_parts[1] if len(name_parts) > 1 else "Artisan"

    user = User.objects.filter(email__iexact=safe_email).first()
    if not user:
        user = User.objects.create_user(
            username=safe_email,
            email=safe_email,
            password=None,
            first_name=first_name,
            last_name=last_name,
        )
    else:
        user.first_name = user.first_name or first_name
        user.last_name = user.last_name or last_name
        user.save(update_fields=["first_name", "last_name"])

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = "artisan"
    profile.phone = phone
    profile.location = ", ".join(part for part in [community, district] if part)
    profile.bio = bio
    profile.craft_specialty = craft_name
    profile.years_experience = years_experience
    profile.save()

    group, _ = Group.objects.get_or_create(name="artisan")
    user.groups.add(group)

    craft, _ = CraftTradition.objects.get_or_create(
        name=craft_name,
        defaults={
            "ethnic_group": "Community documented during Telegram onboarding",
            "region": district,
            "description": f"{craft_name} craft tradition added during Telegram artisan onboarding.",
            "gi_status": "none",
        },
    )

    return Artisan.objects.create(
        user=user,
        craft_tradition=craft,
        bio=bio,
        community=community,
        district=district,
        phone=phone,
        momo_number=momo_number,
        telegram_chat_id=chat_id,
        onboarded_via="telegram",
        years_experience=years_experience,
    )


@sync_to_async
def get_order(order_id: int) -> Order | None:
    return Order.objects.filter(pk=order_id).select_related("product", "artisan", "artisan__user").first()


@sync_to_async
def get_order_for_requester(order_id: int, *, chat_id: int, email: str = "") -> Order | None:
    """
    Fetch an order only if it belongs to the requesting Telegram user —
    either the order was placed from this chat_id, or the caller supplies
    the matching buyer email that is on file for the order.
    """
    qs = Order.objects.select_related("product", "artisan", "artisan__user").filter(pk=order_id)
    order = qs.first()
    if not order:
        return None
    if order.shipping_address and order.shipping_address.get("telegram_chat_id") == chat_id:
        return order
    if email and order.buyer_email and order.buyer_email.strip().lower() == email.strip().lower():
        return order
    return None


@sync_to_async
def buyer_orders(*, chat_id: int, email: str = "", limit: int = 8) -> list[Order]:
    """
    List orders belonging to the requester. Always scoped to this chat_id;
    an email filter is only applied when it matches the caller's chat_id
    (prevents enumerating other people's orders by guessing emails).
    """
    qs = Order.objects.select_related("product", "artisan", "artisan__user").order_by("-created_at")
    qs = qs.filter(shipping_address__telegram_chat_id=chat_id)
    if email:
        qs = qs.filter(buyer_email__iexact=email)
    return list(qs[:limit])



@sync_to_async
def create_checkout(
    *,
    product_slug: str,
    phone: str,
    email: str,
    buyer_name: str,
    country: str = "UG",
    payment_method: str = "momo",
    chat_id: int | None = None,
    gift: GiftPayload | None = None,
):
    product = Product.objects.get(slug=product_slug, status="active")
    address = AddressPayload(buyer_name, country)
    address_dict = address.dict()
    if chat_id:
        address_dict["telegram_chat_id"] = chat_id
        address.dict = lambda: address_dict

    payload = SimpleNamespace(
        product_id=product.id,
        quantity=1,
        payment_method=payment_method,
        shipping_name=buyer_name,
        buyer_email=email,
        buyer_phone=phone,
        shipping_country=country,
        shipping_address=address,
        gift_details=gift,
    )
    order = create_order_from_payload(payload)
    transaction = initiate_payment_for_order(order, phone_number=phone)
    if not transaction.checkout_url:
        transaction.checkout_url = payment_url(order, transaction.reference)
        transaction.response_payload["telegram_payment_link"] = transaction.checkout_url
        transaction.save(update_fields=["checkout_url", "response_payload", "updated_at"])
    return order, transaction


@sync_to_async
def initiate_order_payment(order_id: int, phone: str):
    order = Order.objects.get(pk=order_id)
    transaction = initiate_payment_for_order(order, phone_number=phone)
    if not transaction.checkout_url:
        transaction.checkout_url = payment_url(order, transaction.reference)
        transaction.response_payload["telegram_payment_link"] = transaction.checkout_url
        transaction.save(update_fields=["checkout_url", "response_payload", "updated_at"])
    return order, transaction


def _artisan_earnings_sync(chat_id: int) -> dict:
    artisan = Artisan.objects.filter(telegram_chat_id=chat_id, is_active=True).first()
    if not artisan:
        return {"artisan": None}
    paid_total = (
        Order.objects.filter(artisan=artisan, status="delivered", payout_status="paid")
        .aggregate(total=Sum("artisan_earnings_ugx"))
        .get("total")
        or 0
    )
    pending_total = (
        Order.objects.filter(artisan=artisan, status__in=["paid", "confirmed", "dispatched", "in_transit", "delivered"])
        .exclude(payout_status="paid")
        .aggregate(total=Sum("artisan_earnings_ugx"))
        .get("total")
        or 0
    )
    return {
        "artisan": artisan,
        "paid_total": paid_total,
        "pending_total": pending_total,
        "orders": Order.objects.filter(artisan=artisan).count(),
    }


@sync_to_async
def artisan_earnings(chat_id: int) -> dict:
    return _artisan_earnings_sync(chat_id)


@sync_to_async
def create_payout_request(chat_id: int) -> dict:
    data = _artisan_earnings_sync(chat_id)
    artisan = data.get("artisan")
    if not artisan:
        return data
    return {
        **data,
        "reference": f"PAYOUT-{artisan.id}-{uuid4().hex[:8].upper()}",
        "momo": artisan.momo_number or artisan.phone,
    }


@sync_to_async
def create_listing_from_telegram(
    *,
    chat_id: int,
    name: str,
    price_ugx: Decimal,
    story: str,
    photo_bytes: bytes | None = None,
    photo_name: str = "telegram-product.jpg",
) -> Product:
    artisan = Artisan.objects.select_related("craft_tradition", "user").get(telegram_chat_id=chat_id, is_active=True)

    product = Product.objects.create(
        artisan=artisan,
        craft_tradition=artisan.craft_tradition,
        name=name,
        story=story,
        story_draft=story,
        story_draft_language="voice",
        story_draft_at=timezone.now(),
        material="To be confirmed",
        technique=artisan.craft_tradition.name,
        days_to_make=1,
        price_ugx=price_ugx,
        price_usd=(price_ugx / Decimal("4200")).quantize(Decimal("0.01")),
        stock=1,
        status="draft",
    )
    if photo_bytes:
        photo = ProductPhoto(product=product, caption=name, is_hero=True)
        photo.image.save(photo_name, ContentFile(photo_bytes), save=True)

    ProvenanceRecord.objects.create(
        product=product,
        artisan_name=artisan.full_name,
        community=artisan.community,
        district=artisan.district,
        craft_tradition=artisan.craft_tradition.name,
        ethnic_group=artisan.craft_tradition.ethnic_group,
        technique_detail=product.technique,
        material_source=product.material,
        gi_status=artisan.craft_tradition.gi_status,
    )
    send_telegram_announcement(
        f"*New Telegram listing draft*\n"
        f"{product.name}\n"
        f"{artisan.full_name} - {money(product.price_ugx)}\n"
        f"{product_url(product)}"
    )
    return product


def transcribe_audio(audio_bytes: bytes, filename: str = "telegram-voice.ogg") -> str:
    api_key = getattr(settings, "OPENAI_API_KEY", "")
    if not api_key:
        return ""

    try:
        from openai import OpenAI
    except ImportError:
        return ""

    client = OpenAI(api_key=api_key)
    audio_file = BytesIO(audio_bytes)
    audio_file.name = filename
    result = client.audio.transcriptions.create(
        model=getattr(settings, "OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe"),
        file=audio_file,
        response_format="text",
    )
    return result if isinstance(result, str) else getattr(result, "text", "")
