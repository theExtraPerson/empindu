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
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-none border-2 border-foreground bg-secondary px-6 py-3 font-display text-sm uppercase tracking-[0.25em] text-secondary-foreground hover:bg-secondary/90 sm:tracking-[0.35em]"
            >
              Learn the story
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-none border-2 border-foreground bg-card p-6 shadow-brutal sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="font-display text-[11px] uppercase tracking-[0.3em] text-secondary">
                  For makers, collectives, and small businesses
                </p>
                <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                  Start onboarding and unlock your artisan workspace.
                </h2>
                <p className="max-w-xl font-body leading-7 text-muted-foreground">
                  Create your profile, publish products, manage your public story, and track earnings from a dedicated dashboard built for craft-led businesses.
                </p>
              </div>
              <Link
                href="/onboarding"
                className="inline-flex min-h-[48px] items-center justify-center rounded-none border-2 border-foreground bg-background px-6 py-3 font-display text-sm uppercase tracking-[0.25em] text-foreground transition-all hover:bg-muted sm:tracking-[0.35em]"
              >
                Become an artist
              </Link>
            </div>
          </div>

          <div className="rounded-none border-2 border-foreground bg-background p-6 shadow-brutal sm:p-8">
            <p className="font-display text-[11px] uppercase tracking-[0.3em] text-secondary">What you get</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>• A shareable artisan profile that feels professional and story-led.</li>
              <li>• Guided product publishing with clear pricing and impact visibility.</li>
              <li>• A simple workspace for orders, messages, and growing your craft business.</li>
            </ul>
          </div>
        </div>

        <FeaturedArtisans />
      </div>
    </section>
  );
}
