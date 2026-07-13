import type { Metadata } from 'next';

import { fetchProductsSSR } from '@/lib/server-api';
import { MarketplaceGrid } from './MarketplaceGrid';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Marketplace | Empindu — Ugandan Heritage Crafts',
  description:
    "Shop curated Ugandan artisan goods with visible provenance and story-first product pages. Baskets, textiles, pottery, beadwork and more.",
  openGraph: {
    title: 'Empindu Marketplace — Story-first Ugandan craft',
    description:
      "Curated heritage goods from Uganda's finest makers. Every piece carries provenance, purpose and a maker story.",
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/marketplace' },
};

export default async function Page() {
  const products = (await fetchProductsSSR()) ?? [];

  return (
    <section className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-2 border-foreground bg-card p-5 shadow-brutal sm:mb-10 sm:p-8">
          <span className="mb-4 inline-block border-2 border-secondary px-3 py-1 font-display text-xs uppercase tracking-[0.35em] text-secondary-foreground">
            Marketplace
          </span>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Curated heritage goods from Uganda&apos;s finest makers.
          </h1>
          <p className="mt-4 max-w-3xl font-body leading-8 text-muted-foreground">
            Explore artisan collections, discover provenance, and choose gifts that support communities downstream.
          </p>
        </header>

        <MarketplaceGrid initialProducts={products} />
      </div>
    </section>
  );
}
