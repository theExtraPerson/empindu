/**
 * Empindu API client for the Django commerce backend.
 * Supports JWT authentication for protected endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Get JWT token from NextAuth session (passed as parameter)
function getAuthToken(accessToken?: string): string | null {
  return accessToken || null;
}

export interface CraftTradition {
  id: number;
  name: string;
  ethnic_group: string;
  region: string;
  description: string;
  gi_status: string;
}

export interface ArtisanSummary {
  slug: string;
  full_name: string;
  community: string;
  district: string;
  craft_tradition: string;
  profile_photo_url: string | null;
  is_certified: boolean;
  years_experience: number;
  order_count?: number;
  total_earnings_ugx?: number;
}

export interface Artisan {
  id: number;
  slug: string;
  full_name: string;
  bio: string;
  community: string;
  district: string;
  craft_tradition: CraftTradition;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  years_experience: number;
  is_certified: boolean;
  order_count: number;
  total_earnings_ugx: number;
  listings: number[];
}

export interface MyArtisanProfile extends Artisan {
  profile_url: string;
  bio_luganda: string;
  bio_swahili: string;
  bio_draft: string | null;
  bio_draft_language: string;
  bio_draft_at: string | null;
  phone: string;
  momo_number: string;
  airtel_number: string;
  telegram_chat_id: number | null;
  is_active: boolean;
  onboarded_via: string;
}

export interface ArtisanDashboardProduct {
  id: number;
  slug: string;
  name: string;
  story: string;
  material: string;
  technique: string;
  days_to_make: number;
  price_ugx: number;
  price_usd: number;
  artisan_earnings_ugx: number;
  heritage_fund_ugx: number;
  stock: number;
  status: 'draft' | 'active' | 'sold_out' | 'archived';
  is_customisable: boolean;
  weight_grams: number;
  hero_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtisanDashboardOrder {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  status: string;
  payout_status: string;
  payment_method: string;
  buyer_email: string;
  buyer_phone: string;
  shipping_name: string;
  shipping_country: string;
  shipping_address: Record<string, unknown>;
  tracking_number: string;
  price_ugx: number;
  price_usd: number;
  artisan_earnings_ugx: number;
  heritage_fund_ugx: number;
  created_at: string;
  paid_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
}

export interface ArtisanDashboard {
  artisan: MyArtisanProfile;
  stats: {
    products: number;
    active_products: number;
    draft_products: number;
    orders: number;
    open_orders: number;
    total_revenue_ugx: number;
    total_earnings_ugx: number;
    pending_payout_ugx: number;
  };
  products: ArtisanDashboardProduct[];
  orders: ArtisanDashboardOrder[];
}

export interface ArtisanProductInput {
  name: string;
  story: string;
  material: string;
  technique: string;
  days_to_make: number;
  price_ugx: number;
  stock: number;
  status: 'draft' | 'active' | 'sold_out' | 'archived';
  is_customisable: boolean;
  weight_grams: number;
}

export interface ArtisanProfileInput {
  bio?: string;
  bio_luganda?: string;
  bio_swahili?: string;
  community?: string;
  district?: string;
  phone?: string;
  momo_number?: string;
  airtel_number?: string;
  years_experience?: number;
}

export interface Provenance {
  artisan_name: string;
  community: string;
  district: string;
  craft_tradition: string;
  ethnic_group: string;
  technique_detail: string;
  material_source: string;
  gi_status: string;
}

export interface ProductPhoto {
  url: string;
  caption: string | null;
  is_hero: boolean;
}

export interface ProductList {
  id: number;
  slug: string;
  name: string;
  story: string;
  price_ugx: number;
  price_usd: number;
  artisan_earnings_ugx: number;
  heritage_fund_ugx: number;
  stock: number;
  artisan: ArtisanSummary;
  hero_photo_url: string | null;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  story: string;
  material: string;
  technique: string;
  days_to_make: number;
  price_ugx: number;
  price_usd: number;
  artisan_earnings_ugx: number;
  heritage_fund_ugx: number;
  stock: number;
  is_customisable: boolean;
  artisan: ArtisanSummary;
  provenance: Provenance | null;
  photos: ProductPhoto[];
}

export interface ShippingAddressInput {
  line1: string;
  city: string;
  country: string;
  postcode?: string;
  notes?: string;
}

export interface GiftDetailsInput {
  recipient_name: string;
  recipient_relationship: string;
  occasion: string;
  personal_message: string;
  gift_wrap?: boolean;
  scheduled_delivery_date?: string;
}

export interface OrderCreateInput {
  product_id: number;
  quantity: number;
  payment_method: 'stripe' | 'momo' | 'airtel' | 'ton';
  shipping_name: string;
  buyer_email: string;
  buyer_phone: string;
  shipping_country: string;
  shipping_address: ShippingAddressInput;
  gift_details?: GiftDetailsInput;
}

export interface GiftOrderItemInput {
  product_id: number;
  quantity: number;
  personalization?: string;
}

export interface GiftOrderRecipientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  personal_message?: string;
}

export interface GiftOrderCreateInput {
  customer_name: string;
  customer_email: string;
  contact_phone?: string;
  company?: string;
  occasion?: string;
  gift_message?: string;
  branding_notes?: string;
  delivery_date?: string;
  notes?: string;
  items: GiftOrderItemInput[];
  recipients: GiftOrderRecipientInput[];
}

export interface GiftOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  contact_phone: string;
  company: string;
  occasion: string;
  gift_message: string;
  branding_notes: string;
  delivery_date: string | null;
  recipient_count: number;
  notes: string;
  total_items: number;
  total_amount_ugx: number;
  status: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price_ugx: number;
    line_total_ugx: number;
    personalization: string;
  }>;
  recipients: Array<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    personal_message: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  product_id: number;
  product_name: string;
  artisan_name: string;
  quantity: number;
  status: string;
  payout_status: string;
  payment_method: string;
  buyer_email: string;
  buyer_phone: string;
  shipping_name: string;
  shipping_country: string;
  price_ugx: number;
  price_usd: number;
  artisan_earnings_ugx: number;
  platform_commission_ugx: number;
  heritage_fund_ugx: number;
  payment_reference: string;
  tracking_number: string;
  created_at: string;
}

export interface ReturnRequestInput {
  reason: string;
  details?: string;
  refund_amount_ugx?: number;
}

export interface ReturnRequest {
  id: number;
  order_id: number;
  reason: string;
  details: string;
  status: string;
  refund_amount_ugx: number;
  created_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
}

export interface PaymentIntent {
  provider: string;
  status: string;
  reference: string;
  amount_ugx: number;
  currency: string;
  checkout_url: string | null;
  client_secret: string | null;
  message: string;
}

export async function apiFetch<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((init?.headers as Record<string, string>) || {}),
  };

  // Add JWT token if available
  const token = getAuthToken(accessToken);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getArtisans(params?: {
  craft_type?: string;
  region?: string;
  certified?: boolean;
}, accessToken?: string): Promise<ArtisanSummary[]> {
  const qs = new URLSearchParams();
  if (params?.craft_type) qs.append('craft_type', params.craft_type);
  if (params?.region) qs.append('region', params.region);
  if (params?.certified !== undefined) qs.append('certified', String(params.certified));
  return apiFetch<ArtisanSummary[]>(`/artisans/?${qs.toString()}`, undefined, accessToken);
}

export async function getArtisan(slug: string, accessToken?: string): Promise<Artisan> {
  return apiFetch<Artisan>(`/artisans/${slug}/`, undefined, accessToken);
}

export async function getCraftTraditions(accessToken?: string): Promise<CraftTradition[]> {
  return apiFetch<CraftTradition[]>('/artisans/traditions/list', undefined, accessToken);
}

export async function getProducts(params?: {
  craft_type?: string;
  region?: string;
  min_usd?: number;
  max_usd?: number;
  occasion?: string;
  artisan_slug?: string;
  page?: number;
  page_size?: number;
}): Promise<ProductList[]> {
  const qs = new URLSearchParams();
  if (params?.craft_type) qs.append('craft_type', params.craft_type);
  if (params?.region) qs.append('region', params.region);
  if (params?.min_usd) qs.append('min_usd', String(params.min_usd));
  if (params?.max_usd) qs.append('max_usd', String(params.max_usd));
  if (params?.occasion) qs.append('occasion', params.occasion);
  if (params?.artisan_slug) qs.append('artisan_slug', params.artisan_slug);
  if (params?.page) qs.append('page', String(params.page));
  if (params?.page_size) qs.append('page_size', String(params.page_size));
  return apiFetch<ProductList[]>(`/products?${qs.toString()}`);
}

export async function getProduct(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`);
}

export async function createOrder(order: OrderCreateInput, accessToken?: string): Promise<Order> {
  return apiFetch<Order>('/orders/', {
    method: 'POST',
    body: JSON.stringify(order),
  }, accessToken);
}

export async function createGiftOrder(order: GiftOrderCreateInput, accessToken?: string): Promise<GiftOrder> {
  return apiFetch<GiftOrder>('/gifting/', {
    method: 'POST',
    body: JSON.stringify(order),
  }, accessToken);
}

export async function getGiftOrders(accessToken?: string): Promise<GiftOrder[]> {
  return apiFetch<GiftOrder[]>('/gifting/', undefined, accessToken);
}

export async function getOrders(params?: { buyer_email?: string }): Promise<Order[]> {
  const qs = new URLSearchParams();
  if (params?.buyer_email) qs.append('buyer_email', params.buyer_email);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<Order[]>(`/orders${suffix}`);
}

export async function getOrder(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`);
}

/* duplicate createOrder removed; use the createOrder(order, accessToken?) variant above */

export async function updateOrderStatus(orderId: number, status: string, accessToken?: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, accessToken);
}

export async function getReturnRequests(orderId: number): Promise<ReturnRequest[]> {
  return apiFetch<ReturnRequest[]>(`/orders/${orderId}/returns`);
}

export async function createReturnRequest(orderId: number, payload: ReturnRequestInput): Promise<ReturnRequest> {
  return apiFetch<ReturnRequest>(`/orders/${orderId}/returns`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function initiatePayment(orderId: number, phoneNumber?: string): Promise<PaymentIntent> {
  return apiFetch<PaymentIntent>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, phone_number: phoneNumber || null }),
  });
}

export async function getMyArtisanDashboard(accessToken: string): Promise<ArtisanDashboard> {
  return apiFetch<ArtisanDashboard>('/artisans/me/dashboard', undefined, accessToken);
}

export async function updateMyArtisanProfile(payload: ArtisanProfileInput, accessToken: string): Promise<MyArtisanProfile> {
  return apiFetch<MyArtisanProfile>('/artisans/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function getMyArtisanProducts(accessToken: string): Promise<ArtisanDashboardProduct[]> {
  return apiFetch<ArtisanDashboardProduct[]>('/artisans/me/products', undefined, accessToken);
}

export async function createMyArtisanProduct(payload: ArtisanProductInput, accessToken: string): Promise<ArtisanDashboardProduct> {
  return apiFetch<ArtisanDashboardProduct>('/artisans/me/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function updateMyArtisanProduct(productId: number, payload: ArtisanProductInput, accessToken: string): Promise<ArtisanDashboardProduct> {
  return apiFetch<ArtisanDashboardProduct>(`/artisans/me/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function archiveMyArtisanProduct(productId: number, accessToken: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/artisans/me/products/${productId}`, {
    method: 'DELETE',
  }, accessToken);
}

export async function uploadMyProductPhoto(productId: number, file: File, accessToken: string, isHero = false): Promise<ProductPhoto> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('is_hero', String(isHero));
  return apiFetch<ProductPhoto>(`/artisans/me/products/${productId}/photos`, {
    method: 'POST',
    body: formData,
  }, accessToken);
}

export async function getMyArtisanOrders(accessToken: string): Promise<ArtisanDashboardOrder[]> {
  return apiFetch<ArtisanDashboardOrder[]>('/artisans/me/orders', undefined, accessToken);
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/docs`);
    return true;
  } catch {
    return false;
  }
}
