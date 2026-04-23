/**
 * Empindu API client for the Django commerce backend.
 * Supports JWT authentication for protected endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Get JWT token from localStorage (or your auth provider)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  // Add JWT token if available
  const token = getAuthToken();
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
}): Promise<ArtisanSummary[]> {
  const qs = new URLSearchParams();
  if (params?.craft_type) qs.append('craft_type', params.craft_type);
  if (params?.region) qs.append('region', params.region);
  if (params?.certified !== undefined) qs.append('certified', String(params.certified));
  return apiFetch<ArtisanSummary[]>(`/artisans/?${qs.toString()}`);
}

export async function getArtisan(slug: string): Promise<Artisan> {
  return apiFetch<Artisan>(`/artisans/${slug}`);
}

export async function getCraftTraditions(): Promise<CraftTradition[]> {
  return apiFetch<CraftTradition[]>('/artisans/traditions/list');
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

export async function getOrders(params?: { buyer_email?: string }): Promise<Order[]> {
  const qs = new URLSearchParams();
  if (params?.buyer_email) qs.append('buyer_email', params.buyer_email);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<Order[]>(`/orders${suffix}`);
}

export async function getOrder(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`);
}

export async function createOrder(payload: OrderCreateInput): Promise<Order> {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(orderId: number, status: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
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

export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/docs`);
    return true;
  } catch {
    return false;
  }
}
