import type { Metadata } from 'next';
import Link from 'next/link';

import { fetchArtisansSSR, fetchCraftTraditionsSSR } from '@/lib/server-api';
import { ArtisanDirectory } from './ArtisanDirectory';
import { FeaturedArtisans } from '@/components/sections/FeaturedArtisans';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Artisans | Empindu — Meet the Makers',
  description:
    "Discover Uganda's artisan collectives — search by craft tradition, region, and certification. Every profile is story-first and directly connected to the marketplace.",
  alternates: { canonical: '/artisans' },
  openGraph: {
    title: 'Meet the Makers — Empindu Artisan Directory',
    description:
      "Browse verified artisans, explore their craft traditions, and buy directly from their collections.",
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

const PAGE_SIZE = 12;

type SP = {
  q?: string;
  craft?: string;
  region?: string;
  certified?: string;
  page?: string;
};

export default async function Page({ searchParams }: { searchParams: SP }) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const certified =
    searchParams.certified === '1' || searchParams.certified === 'true'
      ? true
      : undefined;

  const [artisans, traditions] = await Promise.all([
    fetchArtisansSSR({
      craft_type: searchParams.craft,
      region: searchParams.region,
      certified,
    }),
    fetchCraftTraditionsSSR(),
  ]);

  const hasError = artisans === null;

  return (
    <section className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-6 animate-weave-in">
          <span className="inline-block border-2 border-secondary px-3 py-1 font-display text-xs uppercase tracking-[0.25em] text-secondary-foreground">
            Craft Makers
          </span>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-6xl">
            Discover Uganda&apos;s artisan collectives and maker stories.
          </h1>
          <p className="max-w-3xl font-body leading-8 text-muted-foreground">
            Browse featured artisans, shop directly from their collections, and support sustainable craft economies.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex min-h-[44px] items-center gap-3 border-2 border-foreground bg-secondary px-6 py-3 font-display text-sm uppercase tracking-[0.25em] text-secondary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              Learn the story
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex min-h-[44px] items-center gap-3 border-2 border-foreground bg-background px-6 py-3 font-display text-sm uppercase tracking-[0.25em] text-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
            >
              Become an artisan
            </Link>
          </div>
        </div>

        {hasError ? (
          <div className="border-2 border-destructive bg-card p-8 text-center shadow-brutal">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-destructive">
              Couldn&apos;t reach the maker directory. Please retry shortly.
            </p>
          </div>
        ) : (
          <ArtisanDirectory
            all={artisans ?? []}
            traditions={traditions ?? []}
            page={page}
            pageSize={PAGE_SIZE}
            initial={{
              q: searchParams.q ?? '',
              craft: searchParams.craft ?? '',
              region: searchParams.region ?? '',
              certified: certified ? '1' : '',
            }}
          />
        )}

        <FeaturedArtisans />
      </div>
    </section>
  );
}
