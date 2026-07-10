"""
Products API Endpoints
Story-first product catalogue with provenance
Thrive With Nature
"""
from ninja import Router
from typing import List, Optional
from api.v1.contracts import ProductDetailOut, ProductListOut
from apps.products.models import Product

router = Router(tags=["Products"])


# === Public Endpoints ===
@router.get("/{slug}", response=ProductDetailOut, auth=None)
def get_product(request, slug: str):
    """
    Story-first product detail - called by Next.js Server Component for SSR.
    Returns complete product page data including artisan story and provenance.
    """
    product = (
        Product.objects.select_related(
            "artisan__user",
            "artisan__craft_tradition",
            "provenance",
        )
        .prefetch_related("photos")
        .get(slug=slug, status="active")
    )

    provenance = None
    if hasattr(product, "provenance"):
        try:
            provenance = product.provenance
        except Exception:
            provenance = None

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
        "is_customisable": product.is_customisable,
        "artisan": {
            "slug": product.artisan.slug,
            "full_name": product.artisan.full_name,
            "community": product.artisan.community,
            "district": product.artisan.district,
            "craft_tradition": product.artisan.craft_tradition.name,
            "profile_photo_url": product.artisan.profile_photo.url
            if product.artisan.profile_photo
            else None,
            "is_certified": product.artisan.is_certified,
            "years_experience": product.artisan.years_experience,
        },
        "provenance": provenance,
        "photos": [
            {
                "url": photo.image.url,
                "caption": photo.caption,
                "is_hero": photo.is_hero,
            }
            for photo in product.photos.all()
        ],
    }


@router.get("", response=List[ProductListOut], auth=None)
def list_products(
    request,
    craft_type: Optional[str] = None,
    region: Optional[str] = None,
    min_usd: Optional[float] = None,
    max_usd: Optional[float] = None,
    occasion: Optional[str] = None,
    artisan_slug: Optional[str] = None,
    page: int = 1,
    page_size: int = 24,
):
    """
    List products with filters
    Supports faceted discovery by craft, region, price, occasion
    """
    from django.core.paginator import Paginator

    queryset = Product.objects.select_related('artisan__user', 'craft_tradition').prefetch_related('photos')

    if craft_type:
        queryset = queryset.filter(craft_tradition__name__icontains=craft_type)
    if region:
        queryset = queryset.filter(artisan__district__icontains=region)
    if min_usd:
        queryset = queryset.filter(price_usd__gte=min_usd)
    if max_usd:
        queryset = queryset.filter(price_usd__lte=max_usd)
    if artisan_slug:
        queryset = queryset.filter(artisan__slug=artisan_slug)

    # Pagination
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.page(page)

    results = []
    for product in page_obj.object_list:
        hero_photo = product.photos.filter(is_hero=True).first()
        results.append(
            {
                "id": product.id,
                "slug": product.slug,
                "name": product.name,
                "story": product.story[:200] + "...",  # Truncated for list view
                "price_ugx": float(product.price_ugx),
                "price_usd": float(product.price_usd),
                "artisan_earnings_ugx": product.artisan_earnings_ugx,
                "heritage_fund_ugx": product.heritage_fund_ugx,
                "stock": product.stock,
                "artisan": {
                    "slug": product.artisan.slug,
                    "full_name": product.artisan.full_name,
                    "community": product.artisan.community,
                    "district": product.artisan.district,
                    "craft_tradition": product.artisan.craft_tradition.name,
                    "profile_photo_url": product.artisan.profile_photo.url
                    if product.artisan.profile_photo
                    else None,
                    "is_certified": product.artisan.is_certified,
                    "years_experience": product.artisan.years_experience,
                },
                "hero_photo_url": hero_photo.image.url if hero_photo else None,
            }
        )

    return results
