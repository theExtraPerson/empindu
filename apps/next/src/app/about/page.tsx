import Link from 'next/link';

export default function Page() {
  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl border-2 border-foreground bg-card p-10 shadow-brutal">
        <div className="mb-8 space-y-4">
          <span className="inline-block border-2 border-secondary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground">
            About Empindu
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-foreground tracking-tight">
            Crafted for heritage, built for modern marketplaces.
          </h1>
          <p className="max-w-3xl text-muted-foreground font-body leading-8">
            Empindu is a story-first Ugandan artisan marketplace that pairs handmade goods with high-impact commerce.
            Every product page, checkout flow, and gifting experience is designed to celebrate craft, strengthen trust,
            and make every purchase feel meaningful.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-2 border-foreground bg-background p-6">
            <h2 className="font-display text-2xl text-secondary tracking-tight mb-4">Our values</h2>
            <ul className="space-y-3 text-muted-foreground font-body">
              <li>• Transparent artisan earnings</li>
              <li>• Heritage storytelling at every touchpoint</li>
              <li>• Responsive, modern buying experience</li>
              <li>• Sustainable craft systems designed for community income</li>
            </ul>
          </div>

          <div className="border-2 border-foreground bg-background p-6">
            <h2 className="font-display text-2xl text-secondary tracking-tight mb-4">What makes us different</h2>
            <p className="text-muted-foreground font-body leading-7">
              We treat every product listing as a cultural narrative, not just a SKU. That means clear provenance,
              visible maker profiles, and a checkout that reflects the value of craft.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border-2 border-foreground bg-background p-5">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-secondary">For buyers</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">A calm, confident experience with visible stories, transparent pricing, and gift-ready options.</p>
          </div>
          <div className="border-2 border-foreground bg-background p-5">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-secondary">For artisans</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">An onboarding flow and workspace that help makers publish with pride and manage sales simply.</p>
          </div>
          <div className="border-2 border-foreground bg-background p-5">
            <p className="font-display text-sm uppercase tracking-[0.25em] text-secondary">For communities</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Every interaction is designed to preserve heritage, increase visibility, and support sustainable income.</p>
          </div>
        </div>

        <div className="mt-10 border-t-2 border-foreground pt-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-3 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground transition hover:bg-secondary/90"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
