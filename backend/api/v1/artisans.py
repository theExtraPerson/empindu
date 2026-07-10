"""
Artisans API Endpoints
Profile management, onboarding, and public artisan pages
Thrive With Nature
"""
from ninja import File, Router, Schema
from ninja.files import UploadedFile
from typing import List, Optional
from decimal import Decimal
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from ninja.errors import HttpError
from apps.artisans.models import Artisan, CraftTradition
from apps.orders.models import Order
from apps.products.models import Product, ProductPhoto, ProvenanceRecord
from apps.telegram_bot.announcements import send_telegram_announcement
from api.v1.contracts import ArtisanBriefOut, ArtisanDetailOut, CraftTraditionOut
from ninja_jwt.authentication import JWTAuth

router = Router(tags=["Artisans"])


def _ensure_missing_artisan_slugs():
    for artisan in Artisan.objects.filter(Q(slug__isnull=True) | Q(slug="")):
        artisan.save()


def _get_public_artisan(slug: str):
    _ensure_missing_artisan_slugs()
    slug = (slug or "").strip()
    if not slug:
        return None

    queryset = Artisan.objects.select_related("user", "craft_tradition").filter(is_active=True)
    artisan = queryset.filter(slug__iexact=slug).first()
    if artisan:
        return artisan

    if slug.isdigit():
        return queryset.filter(pk=int(slug)).first()

    return None


# === Public Endpoints ===
@router.get("/{slug}", response=ArtisanDetailOut, auth=None)
def get_artisan(request, slug: str):
    """
    Get full artisan profile - story-first SSR page data
    Used by Next.js Server Components for artisan profile pages
    """
    artisan = _get_public_artisan(slug)
    if not artisan:
        raise HttpError(404, "Artisan profile not found")

    return {
        "id": artisan.id,
        "slug": artisan.slug,
        "full_name": artisan.full_name,
        "bio": artisan.bio,
        "community": artisan.community,
        "district": artisan.district,
        "craft_tradition": {
            "id": artisan.craft_tradition.id,
            "name": artisan.craft_tradition.name,
            "ethnic_group": artisan.craft_tradition.ethnic_group,
            "region": artisan.craft_tradition.region,
            "description": artisan.craft_tradition.description,
            "gi_status": artisan.craft_tradition.gi_status,
        },
        "profile_photo_url": artisan.profile_photo.url if artisan.profile_photo else None,
        "cover_photo_url": artisan.cover_photo.url if artisan.cover_photo else None,
        "years_experience": artisan.years_experience,
        "is_certified": artisan.is_certified,
        "order_count": artisan.order_count,
        "total_earnings_ugx": artisan.total_earnings_ugx,
        "listings": list(artisan.listings.filter(status="active").values_list("id", flat=True)),
    }


@router.get("", response=List[ArtisanBriefOut], auth=None)
def list_artisans(
    request,
    craft_type: Optional[str] = None,
    region: Optional[str] = None,
    certified: Optional[bool] = None,
):
    """
    List artisans with filters
    Supports discovery by craft tradition, region, certification status
    """
    _ensure_missing_artisan_slugs()
    qs = Artisan.objects.filter(is_active=True).select_related("craft_tradition")

    if craft_type:
        qs = qs.filter(craft_tradition__name__icontains=craft_type)
    if region:
        qs = qs.filter(district__icontains=region)
    if certified:
        qs = qs.filter(is_certified=certified)

    return [
        {
            "slug": a.slug,
            "full_name": a.full_name,
            "community": a.community,
            "district": a.district,
            "craft_tradition": a.craft_tradition.name,
            "profile_photo_url": a.profile_photo.url if a.profile_photo else None,
            "is_certified": a.is_certified,
            "years_experience": a.years_experience,
        }
        for a in qs
    ]


@router.get("/traditions/list", response=List[CraftTraditionOut], auth=None)
def list_craft_traditions(request):
    """List all craft traditions - used for filtering and discovery"""
    traditions = CraftTradition.objects.all()
    return list(traditions)


# === Authenticated Artisan Endpoints ===

class ArtisanOnboardingIn(Schema):
    craft_tradition_id: Optional[int] = None
    craft_traditions: Optional[List[str]] = None
    bio: str
    bio_luganda: Optional[str] = None
    bio_swahili: Optional[str] = None
    community: str
    district: str
    phone: str
    momo_number: Optional[str] = None
    airtel_number: Optional[str] = None
    years_experience: int = 0
    onboarded_via: str = "web"


class ArtisanProfileUpdateIn(Schema):
    bio: Optional[str] = None
    bio_luganda: Optional[str] = None
    bio_swahili: Optional[str] = None
    community: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    momo_number: Optional[str] = None
    airtel_number: Optional[str] = None
    years_experience: Optional[int] = None


class ArtisanProductIn(Schema):
    name: str
    story: str
    material: str
    technique: str
    days_to_make: int = 1
    price_ugx: float
    stock: int = 1
    status: str = "draft"
    is_customisable: bool = False
    weight_grams: int = 0


class ArtisanBusinessIn(Schema):
    business_name: str
    business_type: str = "solo"
    registration_status: str = "not_registered"
    registration_number: Optional[str] = ""
    tax_id: Optional[str] = ""
    description: Optional[str] = ""


def _get_current_artisan(user) -> Artisan:
    if not user or not hasattr(user, "artisan"):
        raise HttpError(404, "Artisan profile not found")
    return user.artisan


def _absolute_media_url(request, field) -> Optional[str]:
    if not field:
        return None
    try:
        return request.build_absolute_uri(field.url)
    except Exception:
        return field.url


def _serialize_my_artisan(request, artisan: Artisan) -> dict:
    return {
        "id": artisan.id,
        "slug": artisan.slug,
        "profile_url": f"/artisans/{artisan.slug}",
        "full_name": artisan.full_name,
        "bio": artisan.bio,
        "bio_luganda": artisan.bio_luganda,
        "bio_swahili": artisan.bio_swahili,
        "bio_draft": artisan.bio_draft,
        "bio_draft_language": artisan.bio_draft_language,
        "bio_draft_at": artisan.bio_draft_at.isoformat() if artisan.bio_draft_at else None,
        "community": artisan.community,
        "district": artisan.district,
        "phone": artisan.phone,
        "momo_number": artisan.momo_number,
        "airtel_number": artisan.airtel_number,
        "telegram_chat_id": artisan.telegram_chat_id,
        "years_experience": artisan.years_experience,
        "is_certified": artisan.is_certified,
        "is_active": artisan.is_active,
        "onboarded_via": artisan.onboarded_via,
        "profile_photo_url": _absolute_media_url(request, artisan.profile_photo),
        "cover_photo_url": _absolute_media_url(request, artisan.cover_photo),
        "craft_tradition": {
            "id": artisan.craft_tradition.id,
            "name": artisan.craft_tradition.name,
            "ethnic_group": artisan.craft_tradition.ethnic_group,
            "region": artisan.craft_tradition.region,
            "description": artisan.craft_tradition.description,
            "gi_status": artisan.craft_tradition.gi_status,
        },
        "order_count": artisan.order_count,
        "total_earnings_ugx": artisan.total_earnings_ugx,
    }


def _serialize_artisan_product(request, product: Product) -> dict:
    hero_photo = product.photos.filter(is_hero=True).first() or product.photos.first()
    return {
        "id": product.id,
        "slug": product.slug,
        "name": product.name,
        "story": product.story,
        "material": product.material,
        "technique": product.technique,
        "days_to_make": product.days_to_make,
        "price_ugx": float(product.price_ugx),
        "price_usd": float(product.price_usd),
        "artisan_earnings_ugx": product.artisan_earnings_ugx,
        "heritage_fund_ugx": product.heritage_fund_ugx,
        "stock": product.stock,
        "status": product.status,
        "is_customisable": product.is_customisable,
        "weight_grams": product.weight_grams,
        "hero_photo_url": _absolute_media_url(request, hero_photo.image) if hero_photo else None,
        "updated_at": product.updated_at.isoformat(),
        "created_at": product.created_at.isoformat(),
    }


def _serialize_artisan_order(order: Order) -> dict:
    return {
        "id": order.id,
        "product_id": order.product_id,
        "product_name": order.product.name,
        "quantity": order.quantity,
        "status": order.status,
        "payout_status": order.payout_status,
        "payment_method": order.payment_method,
        "buyer_email": order.buyer_email,
        "buyer_phone": order.buyer_phone,
        "shipping_name": order.shipping_name,
        "shipping_country": order.shipping_country,
        "shipping_address": order.shipping_address,
        "tracking_number": order.tracking_number,
        "price_ugx": float(order.price_ugx),
        "price_usd": float(order.price_usd),
        "artisan_earnings_ugx": float(order.artisan_earnings_ugx),
        "heritage_fund_ugx": float(order.heritage_fund_ugx),
        "created_at": order.created_at.isoformat(),
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "dispatched_at": order.dispatched_at.isoformat() if order.dispatched_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
    }


def _price_usd(price_ugx: float) -> Decimal:
    return (Decimal(str(price_ugx)) / Decimal("4200")).quantize(Decimal("0.01"))


def _sync_profile_from_artisan(artisan: Artisan) -> None:
    profile = getattr(artisan.user, "profile", None)
    if profile is None:
        return
    profile.role = "artisan"
    profile.phone = artisan.phone
    profile.location = ", ".join(part for part in [artisan.community, artisan.district] if part)
    profile.bio = artisan.bio
    profile.craft_specialty = artisan.craft_tradition.name
    profile.years_experience = artisan.years_experience
    profile.save()


@router.post("/onboard", auth=JWTAuth())
def onboard_artisan(request, data: ArtisanOnboardingIn):
    """Complete artisan onboarding after user registration"""
    user = request.user

    # Check if user already has an artisan profile
    if hasattr(user, 'artisan'):
        raise HttpError(400, "User already has an artisan profile")

    selected_crafts = [craft.strip() for craft in (data.craft_traditions or []) if craft.strip()]
    primary_craft_name = selected_crafts[0] if selected_crafts else ""

    if data.craft_tradition_id:
        craft_tradition = get_object_or_404(CraftTradition, id=data.craft_tradition_id)
    elif primary_craft_name:
        craft_tradition, _ = CraftTradition.objects.get_or_create(
            name=primary_craft_name,
            defaults={
                "ethnic_group": "Community documented during onboarding",
                "region": data.district,
                "description": f"{primary_craft_name} craft tradition added during artisan onboarding.",
                "gi_status": "none",
            },
        )
    else:
        raise HttpError(400, "At least one craft tradition is required")

    # Create artisan profile
    artisan = Artisan.objects.create(
        user=user,
        craft_tradition=craft_tradition,
        bio=data.bio,
        bio_luganda=data.bio_luganda,
        bio_swahili=data.bio_swahili,
        community=data.community,
        district=data.district,
        phone=data.phone,
        momo_number=data.momo_number,
        airtel_number=data.airtel_number,
        years_experience=data.years_experience,
        onboarded_via=data.onboarded_via,
    )

    profile = getattr(user, "profile", None)
    if profile is not None:
        profile.role = "artisan"
        profile.phone = data.phone
        profile.location = ", ".join(part for part in [data.community, data.district] if part)
        profile.bio = data.bio
        profile.craft_specialty = ", ".join(selected_crafts) or craft_tradition.name
        profile.years_experience = data.years_experience
        profile.save()

    send_telegram_announcement(
        f"*New Empindu artisan*\n"
        f"{artisan.full_name} - {artisan.craft_tradition.name}\n"
        f"{artisan.community}, {artisan.district}\n"
        f"{request.build_absolute_uri('/').rstrip('/')}/artisans/{artisan.slug}"
    )

    return {
        "id": artisan.id,
        "slug": artisan.slug,
        "message": "Artisan profile created successfully"
    }


@router.get("/me", auth=JWTAuth())
def get_my_artisan_profile(request):
    """Get current user's artisan profile"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan

    return {
        "id": artisan.id,
        "slug": artisan.slug,
        "full_name": artisan.full_name,
        "bio": artisan.bio,
        "bio_luganda": artisan.bio_luganda,
        "bio_swahili": artisan.bio_swahili,
        "community": artisan.community,
        "district": artisan.district,
        "phone": artisan.phone,
        "momo_number": artisan.momo_number,
        "airtel_number": artisan.airtel_number,
        "years_experience": artisan.years_experience,
        "is_certified": artisan.is_certified,
        "profile_photo_url": artisan.profile_photo.url if artisan.profile_photo else None,
        "cover_photo_url": artisan.cover_photo.url if artisan.cover_photo else None,
        "craft_tradition": {
            "id": artisan.craft_tradition.id,
            "name": artisan.craft_tradition.name,
            "ethnic_group": artisan.craft_tradition.ethnic_group,
            "region": artisan.craft_tradition.region,
        },
        "order_count": artisan.order_count,
        "total_earnings_ugx": artisan.total_earnings_ugx,
    }


@router.put("/me", auth=JWTAuth())
def update_my_artisan_profile(request, data: ArtisanProfileUpdateIn):
    """Update current user's artisan profile"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan

    # Update fields if provided
    for field in ['bio', 'bio_luganda', 'bio_swahili', 'community', 'district',
                  'phone', 'momo_number', 'airtel_number', 'years_experience']:
        if getattr(data, field) is not None:
            setattr(artisan, field, getattr(data, field))

    artisan.save()
    _sync_profile_from_artisan(artisan)

    return {"message": "Profile updated successfully"}


@router.get("/me/dashboard", auth=JWTAuth())
def get_my_artisan_dashboard(request):
    artisan = _get_current_artisan(request.user)
    products = Product.objects.filter(artisan=artisan).prefetch_related("photos")
    orders = Order.objects.filter(artisan=artisan).select_related("product")

    total_revenue = sum(order.price_ugx for order in orders)
    pending_payout = sum(
        order.artisan_earnings_ugx
        for order in orders.exclude(payout_status="paid")
        if order.status in ["paid", "confirmed", "dispatched", "in_transit", "delivered"]
    )

    return {
        "artisan": _serialize_my_artisan(request, artisan),
        "stats": {
            "products": products.count(),
            "active_products": products.filter(status="active").count(),
            "draft_products": products.filter(status="draft").count(),
            "orders": orders.count(),
            "open_orders": orders.exclude(status__in=["delivered", "refunded"]).count(),
            "total_revenue_ugx": float(total_revenue),
            "total_earnings_ugx": artisan.total_earnings_ugx,
            "pending_payout_ugx": float(pending_payout),
        },
        "products": [_serialize_artisan_product(request, product) for product in products[:8]],
        "orders": [_serialize_artisan_order(order) for order in orders[:8]],
    }


@router.patch("/me/profile", auth=JWTAuth())
def patch_my_artisan_profile(request, data: ArtisanProfileUpdateIn):
    artisan = _get_current_artisan(request.user)
    for field in [
        "bio",
        "bio_luganda",
        "bio_swahili",
        "community",
        "district",
        "phone",
        "momo_number",
        "airtel_number",
        "years_experience",
    ]:
        value = getattr(data, field)
        if value is not None:
            setattr(artisan, field, value)
    artisan.save()
    _sync_profile_from_artisan(artisan)
    return _serialize_my_artisan(request, artisan)


@router.get("/me/products", auth=JWTAuth())
def list_my_artisan_products(request):
    artisan = _get_current_artisan(request.user)
    products = Product.objects.filter(artisan=artisan).prefetch_related("photos")
    return [_serialize_artisan_product(request, product) for product in products]


@router.post("/me/products", auth=JWTAuth())
def create_my_artisan_product(request, data: ArtisanProductIn):
    artisan = _get_current_artisan(request.user)
    if data.status not in ["draft", "active", "sold_out", "archived"]:
        raise HttpError(400, "Invalid product status")

    product = Product.objects.create(
        artisan=artisan,
        craft_tradition=artisan.craft_tradition,
        name=data.name,
        story=data.story,
        material=data.material,
        technique=data.technique,
        days_to_make=data.days_to_make,
        price_ugx=Decimal(str(data.price_ugx)),
        price_usd=_price_usd(data.price_ugx),
        stock=data.stock,
        status=data.status,
        is_customisable=data.is_customisable,
        weight_grams=data.weight_grams,
    )
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
        f"*New Empindu listing*\n"
        f"{product.name}\n"
        f"{artisan.full_name} - UGX {int(product.price_ugx):,}\n"
        f"{request.build_absolute_uri('/').rstrip('/')}/marketplace/{product.slug}"
    )
    return _serialize_artisan_product(request, product)


@router.patch("/me/products/{product_id}", auth=JWTAuth())
def update_my_artisan_product(request, product_id: int, data: ArtisanProductIn):
    artisan = _get_current_artisan(request.user)
    product = get_object_or_404(Product, id=product_id, artisan=artisan)
    if data.status not in ["draft", "active", "sold_out", "archived"]:
        raise HttpError(400, "Invalid product status")

    product.name = data.name
    product.story = data.story
    product.material = data.material
    product.technique = data.technique
    product.days_to_make = data.days_to_make
    product.price_ugx = Decimal(str(data.price_ugx))
    product.price_usd = _price_usd(data.price_ugx)
    product.stock = data.stock
    product.status = data.status
    product.is_customisable = data.is_customisable
    product.weight_grams = data.weight_grams
    product.save()

    if hasattr(product, "provenance"):
        product.provenance.technique_detail = product.technique
        product.provenance.material_source = product.material
        product.provenance.save()

    return _serialize_artisan_product(request, product)


@router.delete("/me/products/{product_id}", auth=JWTAuth())
def archive_my_artisan_product(request, product_id: int):
    artisan = _get_current_artisan(request.user)
    product = get_object_or_404(Product, id=product_id, artisan=artisan)
    product.status = "archived"
    product.save(update_fields=["status", "updated_at"])
    return {"message": "Product archived"}


@router.post("/me/products/{product_id}/photos", auth=JWTAuth())
def upload_my_product_photo(
    request,
    product_id: int,
    image: UploadedFile = File(...),
    is_hero: bool = False,
    caption: str = "",
):
    artisan = _get_current_artisan(request.user)
    product = get_object_or_404(Product, id=product_id, artisan=artisan)
    if is_hero:
        product.photos.update(is_hero=False)
    photo = ProductPhoto.objects.create(
        product=product,
        image=image,
        caption=caption,
        is_hero=is_hero,
        sort_order=product.photos.count(),
    )
    return {
        "url": _absolute_media_url(request, photo.image),
        "caption": photo.caption,
        "is_hero": photo.is_hero,
    }


@router.get("/me/orders", auth=JWTAuth())
def list_my_artisan_orders(request):
    artisan = _get_current_artisan(request.user)
    orders = Order.objects.filter(artisan=artisan).select_related("product")
    return [_serialize_artisan_order(order) for order in orders]


@router.post("/me/profile-photo", auth=JWTAuth())
def upload_profile_photo(request, profile_photo: UploadedFile = File(...)):
    """Upload profile photo for artisan"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan
    artisan.profile_photo = profile_photo
    artisan.save()

    return {
        "profile_photo_url": artisan.profile_photo.url,
        "message": "Profile photo uploaded successfully"
    }


@router.post("/me/cover-photo", auth=JWTAuth())
def upload_cover_photo(request, cover_photo: UploadedFile = File(...)):
    """Upload cover photo for artisan"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan
    artisan.cover_photo = cover_photo
    artisan.save()

    return {
        "cover_photo_url": artisan.cover_photo.url,
        "message": "Cover photo uploaded successfully"
    }


@router.post("/me/voice-bio", auth=JWTAuth())
def submit_voice_bio(request, voice_recording: UploadedFile = File(...), language: str = "en"):
    """Submit voice recording for bio transcription"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan

    # Save voice recording temporarily for transcription
    # In a real implementation, you'd send this to a transcription service
    # For now, we'll just mark that a draft exists
    artisan.bio_draft = "Voice recording submitted for transcription"
    artisan.bio_draft_language = language
    artisan.bio_draft_at = timezone.now()
    artisan.save()

    return {
        "message": "Voice recording submitted for transcription",
        "draft_id": artisan.id
    }


@router.post("/me/voice-bio/{draft_id}/approve", auth=JWTAuth())
def approve_voice_bio_draft(request, draft_id: int):
    """Approve transcribed voice bio draft"""
    user = request.user

    if not hasattr(user, 'artisan'):
        raise HttpError(404, "Artisan profile not found")

    artisan = user.artisan

    if not artisan.bio_draft:
        raise HttpError(400, "No draft bio available")

    # Move draft to live bio
    artisan.bio = artisan.bio_draft
    artisan.bio_draft = ""
    artisan.bio_draft_language = ""
    artisan.bio_draft_at = None
    artisan.save()

    return {"message": "Voice bio approved and published"}
