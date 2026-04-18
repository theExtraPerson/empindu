"""
Artisans API Endpoints
Profile management, onboarding, and public artisan pages
Thrive With Nature
"""
from ninja import Router
from typing import List, Optional
from apps.artisans.models import Artisan, CraftTradition
from api.v1.contracts import ArtisanBriefOut, ArtisanDetailOut, CraftTraditionOut

router = Router(tags=["Artisans"])


# === Public Endpoints ===
@router.get("/{slug}", response=ArtisanDetailOut, auth=None)
def get_artisan(request, slug: str):
    """
    Get full artisan profile - story-first SSR page data
    Used by Next.js Server Components for artisan profile pages
    """
    artisan = Artisan.objects.select_related(
        "user", "craft_tradition"
    ).get(slug=slug, is_active=True)

    return {
        "id": artisan.id,
        "slug": artisan.slug,
        "full_name": artisan.full_name,
        "bio": artisan.bio,
        "community": artisan.community,
        "district": artisan.district,
        "craft_tradition": artisan.craft_tradition,
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
