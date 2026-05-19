import Link from 'next/link';
import { FeaturedArtisans } from '@/components/sections/FeaturedArtisans';

export default function Page() {
  return (
    <section className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-6">
          <span className="inline-block border-2 border-warm-cream px-3 py-1 font-display text-xs uppercase tracking-[0.25em] text-warm-cream">
            Craft Makers
          </span>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-6xl">
            Discover Uganda's artisan collectives and maker stories.
          </h1>
          <p className="max-w-3xl font-body leading-8 text-muted-foreground">
            Browse featured artisans, shop directly from their collections, and support sustainable craft economies.
          </p>
          <Link
            href="/about"
            className="inline-flex min-h-[44px] items-center gap-3 rounded-none border-2 border-foreground bg-secondary px-6 py-3 font-display text-sm uppercase tracking-[0.25em] text-secondary-foreground hover:bg-secondary/90 sm:tracking-[0.35em]"
          >
            Learn the story
          </Link>
        </div>

        <FeaturedArtisans />
      </div>
    </section>
  );
}
