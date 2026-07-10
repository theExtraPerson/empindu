export function MarketPlace() {
    return (
        <section className="bg-background text-foreground">
        <div className="mx-auto max-w-3xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-block border-2 border-primary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground">
              A Celebration of Craft
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              A marketplace <span className="text-primary italic">designed</span> for <span className="text-primary text-6xl">artisan</span> stories, <span className="text-primary text-6xl">heritage</span>  commerce, and meaningful <span className="text-primary text-6xl">gifting</span>.
            </h2>
            <p className="text-muted-foreground font-body leading-8">
              Empindu connects makers, collectors, and communities with products that carry provenance, purpose, and a bold visual identity. Browse our featured artisans, discover seasonal collections, and shop with confidence.
            </p>
          </div>
        </div>
      </section>
    )
}