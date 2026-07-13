import type { MetadataRoute } from 'next';

import { fetchArtisansSSR, fetchProductsSSR } from '@/lib/server-api';

const BASE_URL = 'https://empindu.lovable.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/marketplace', '/artisans', '/about', '/gifting', '/checkout'].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  );

  const [artisans, products] = await Promise.all([fetchArtisansSSR(), fetchProductsSSR()]);

  const artisanRoutes = (artisans ?? []).map((a) => ({
    url: `${BASE_URL}/artisans/${a.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${BASE_URL}/marketplace/${p.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...artisanRoutes, ...productRoutes];
}
