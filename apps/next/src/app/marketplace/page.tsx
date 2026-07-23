import type { Metadata } from 'next';

import { fetchCraftTraditionsSSR, fetchProductsSSR } from '@/lib/server-api';
import { MarketplaceGrid } from './MarketplaceGrid';
import { MarketplaceFilters } from './MarketplaceFilters';
import { MarketplacePagination } from './MarketplacePagination';

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

const PAGE_SIZE = 12;

type SP = {
  q?: string;
  craft?: string;
  region?: string;
  min?: string;
  max?: string;
  page?: string;
};

export default async function Page({ searchParams }: { searchParams: SP }) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const min_usd = searchParams.min ? Number(searchParams.min) : undefined;
  const max_usd = searchParams.max ? Number(searchParams.max) : undefined;

  const [products, traditions] = await Promise.all([
    fetchProductsSSR({
      craft_type: searchParams.craft,
      region: searchParams.region,
      min_usd: Number.isFinite(min_usd as number) ? min_usd : undefined,
      max_usd: Number.isFinite(max_usd as number) ? max_usd : undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    fetchCraftTraditionsSSR(),
  ]);

  const list = products ?? [];
  const hasMore = list.length === PAGE_SIZE;
  const hasError = products === null;

  return (
    <section className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 border-2 border-foreground bg-card p-5 shadow-brutal sm:mb-10 sm:p-8 animate-weave-in">
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

        <MarketplaceFilters
          initial={{
            q: searchParams.q ?? '',
            craft: searchParams.craft ?? '',
            region: searchParams.region ?? '',
            min: searchParams.min ?? '',
            max: searchParams.max ?? '',
          }}
          traditions={traditions ?? []}
        />

        {hasError ? (
          <div className="mt-8 border-2 border-destructive bg-card p-8 text-center shadow-brutal">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-destructive">
              Couldn&apos;t reach the marketplace. Please retry shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between border-b-2 border-dashed border-foreground/40 pb-3 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span>Page {page}</span>
              <span>{list.length} results</span>
            </div>

            <div className="mt-6">
              <MarketplaceGrid initialProducts={list} searchQuery={searchParams.q ?? ''} />
            </div>

            <MarketplacePagination page={page} hasMore={hasMore} />
          </>
        )}
      </div>
    </section>
  );
}
