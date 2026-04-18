import Link from 'next/link';
import { FeaturedArtisans } from '@/components/sections/FeaturedArtisans';

export default function Page() {
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-6">
          <span className="inline-block border-2 border-warm-cream px-3 py-1 font-display text-xs tracking-[0.25em] uppercase text-warm-cream">
            Craft Makers
          </span>
          <h1 className="font-display text-4xl md:text-6xl tracking-tight text-foreground">
            Discover Uganda’s artisan collectives and maker stories.
          </h1>
          <p className="max-w-3xl text-muted-foreground font-body leading-8">
            Browse featured artisans, shop directly from their collections, and support sustainable craft economies.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-3 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
          >
            Learn the story
          </Link>
        </div>

        <FeaturedArtisans />
      </div>
    </section>
  );
}
