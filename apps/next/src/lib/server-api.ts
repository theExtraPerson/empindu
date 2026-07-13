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

export const fetchProductsSSR = (qs = '') =>
  serverFetch<ProductList[]>(`/products?${qs}`);
export const fetchProductSSR = (slug: string) =>
  serverFetch<Product>(`/products/${encodeURIComponent(slug)}`);
export const fetchArtisansSSR = () =>
  serverFetch<ArtisanSummary[]>('/artisans/');
export const fetchArtisanSSR = (slug: string) =>
  serverFetch<Artisan>(`/artisans/${encodeURIComponent(slug)}`);
