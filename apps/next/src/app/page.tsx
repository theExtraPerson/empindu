import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedArtisans } from '@/components/sections/FeaturedArtisans';
import { LazyTestimonials } from '@/components/sections/LazyTestimonials';

export default function Page() {
  return (
    <>
      <HeroSection />
      <section className="bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl space-y-6">
            <span className="inline-block border-2 border-secondary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground">
              A celebration of craft
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">
              A marketplace designed for artisan stories, heritage commerce, and meaningful gifting.
            </h2>
            <p className="text-muted-foreground font-body leading-8">
              Empindu connects makers, collectors, and communities with products that carry provenance, purpose, and a bold visual identity. Browse our featured artisans, discover seasonal collections, and shop with confidence.
            </p>
          </div>
        </div>
      </section>
      <FeaturedArtisans />
      <LazyTestimonials />
    </>
  );
}
