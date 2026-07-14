/**
 * Server-only fetch helpers against the Django /api/v1 backend.
 * Uses Next.js fetch caching for SSR + SEO.
 */
import 'server-only';

import type { Artisan, ArtisanSummary, Product, ProductList } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function serverFetch<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type ProductFilters = {
  craft_type?: string;
  region?: string;
  min_usd?: number;
  max_usd?: number;
  occasion?: string;
  artisan_slug?: string;
  page?: number;
  page_size?: number;
};

export type ArtisanFilters = {
  craft_type?: string;
  region?: string;
  certified?: boolean;
};

function buildQS(params: Record<string, string | number | boolean | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === null) continue;
    qs.append(k, String(v));
  }
  return qs.toString();
}

export const fetchProductsSSR = (filters: ProductFilters = {}) =>
  serverFetch<ProductList[]>(`/products?${buildQS(filters)}`);

export const fetchProductSSR = (slug: string) =>
  serverFetch<Product>(`/products/${encodeURIComponent(slug)}`);

export const fetchArtisansSSR = (filters: ArtisanFilters = {}) =>
  serverFetch<ArtisanSummary[]>(`/artisans/?${buildQS(filters)}`);

export const fetchArtisanSSR = (slug: string) =>
  serverFetch<Artisan>(`/artisans/${encodeURIComponent(slug)}`);

export const fetchCraftTraditionsSSR = () =>
  serverFetch<Array<{ id: number; name: string; region: string }>>(
    '/artisans/traditions/list',
  );
