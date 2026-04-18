"""
Canonical API schemas shared across frontend and backend.
"""
from typing import List, Optional

from ninja import Schema


class CraftTraditionOut(Schema):
    id: int
    name: str
    ethnic_group: str
    region: str
    description: str
    gi_status: str


class ArtisanBriefOut(Schema):
    slug: str
    full_name: str
    community: str
    district: str
    craft_tradition: str
    profile_photo_url: Optional[str] = None
    is_certified: bool
    years_experience: int


class ArtisanDetailOut(Schema):
    id: int
    slug: str
    full_name: str
    bio: str
    community: str
    district: str
    craft_tradition: CraftTraditionOut
    profile_photo_url: Optional[str] = None
    cover_photo_url: Optional[str] = None
    years_experience: int
    is_certified: bool
    order_count: int
    total_earnings_ugx: int
    listings: List[int]


class ProvenanceOut(Schema):
    artisan_name: str
    community: str
    district: str
    craft_tradition: str
    ethnic_group: str
    technique_detail: str
    material_source: str
    gi_status: str


class ProductPhotoOut(Schema):
    url: str
    caption: Optional[str] = None
    is_hero: bool = False


class ProductListOut(Schema):
    id: int
    slug: str
    name: str
    story: str
    price_ugx: float
    price_usd: float
    artisan_earnings_ugx: int
    heritage_fund_ugx: int
    stock: int
    artisan: ArtisanBriefOut
    hero_photo_url: Optional[str] = None


class ProductDetailOut(ProductListOut):
    material: str
    technique: str
    days_to_make: int
    is_customisable: bool
    provenance: Optional[ProvenanceOut] = None
    photos: List[ProductPhotoOut]


class ShippingAddressIn(Schema):
    line1: str
    city: str
    country: str
    postcode: Optional[str] = ""
    notes: Optional[str] = ""


class GiftDetailsIn(Schema):
    recipient_name: str
    recipient_relationship: str
    occasion: str
    personal_message: str
    gift_wrap: bool = True
    scheduled_delivery_date: Optional[str] = None


class OrderCreateIn(Schema):
    product_id: int
    quantity: int = 1
    payment_method: str
    shipping_name: str
    buyer_email: str
    buyer_phone: str
    shipping_country: str
    shipping_address: ShippingAddressIn
    gift_details: Optional[GiftDetailsIn] = None


class OrderStatusUpdateIn(Schema):
    status: str


class PaymentInitIn(Schema):
    order_id: int
    phone_number: Optional[str] = None


class PaymentIntentOut(Schema):
    provider: str
    status: str
    reference: str
    amount_ugx: float
    currency: str
    checkout_url: Optional[str] = None
    client_secret: Optional[str] = None
    message: str


class OrderOut(Schema):
    id: int
    product_id: int
    product_name: str
    artisan_name: str
    quantity: int
    status: str
    payout_status: str
    payment_method: str
    buyer_email: str
    buyer_phone: str
    shipping_name: str
    shipping_country: str
    price_ugx: float
    price_usd: float
    artisan_earnings_ugx: float
    platform_commission_ugx: float
    heritage_fund_ugx: float
    payment_reference: Optional[str] = ""
    tracking_number: Optional[str] = ""
    created_at: str


class ReturnRequestCreateIn(Schema):
    reason: str
    details: Optional[str] = ""
    refund_amount_ugx: Optional[float] = None


class ReturnRequestOut(Schema):
    id: int
    order_id: int
    reason: str
    details: str
    status: str
    refund_amount_ugx: float
    created_at: str
    reviewed_at: Optional[str] = None
    completed_at: Optional[str] = None


class GiftOrderItemIn(Schema):
    product_id: int
    quantity: int = 1


class GiftOrderItemOut(Schema):
    product_id: int
    product_name: str
    quantity: int
    unit_price_ugx: float
    line_total_ugx: float


class GiftOrderCreateIn(Schema):
    customer_name: str
    customer_email: str
    company: Optional[str] = ""
    notes: Optional[str] = ""
    items: List[GiftOrderItemIn]


class GiftOrderOut(Schema):
    id: int
    customer_name: str
    customer_email: str
    company: str
    notes: str
    total_items: int
    total_amount_ugx: float
    status: str
    items: List[GiftOrderItemOut]
    created_at: str
    updated_at: str
