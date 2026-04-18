import Link from 'next/link';

interface Params {
  slug: string;
}

export default function Page({ params }: { params: Params }) {
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-4 border-2 border-foreground bg-card p-8 shadow-brutal">
          <h1 className="font-display text-4xl text-secondary tracking-tight">Artisan profile</h1>
          <p className="text-muted-foreground font-body leading-7">
            You are viewing the artisan profile for <span className="font-semibold text-foreground">{params.slug.replace(/-/g, ' ')}</span>.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-organic border-2 border-foreground bg-background p-6">
              <h2 className="font-display text-xl text-foreground mb-3">Craft specialty</h2>
              <p className="text-muted-foreground font-body leading-7">
                Authentic artisanal craftsmanship rooted in regional heritage.
              </p>
            </div>
            <div className="rounded-organic border-2 border-foreground bg-background p-6">
              <h2 className="font-display text-xl text-foreground mb-3">Impact</h2>
              <p className="text-muted-foreground font-body leading-7">
                Every purchase supports fair working conditions, local materials, and community resilience.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/artisans"
            className="inline-flex items-center gap-3 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
          >
            Back to artisans
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 rounded-none border-2 border-foreground bg-background px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-foreground hover:bg-muted"
          >
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}
