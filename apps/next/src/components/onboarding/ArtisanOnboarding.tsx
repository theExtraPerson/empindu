'use client';

import { ArtisanOnboardingFlow } from './ArtisanOnboardingFlow';

export function ArtisanOnboarding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b-2 border-foreground bg-bark-brown text-warm-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent 0 14px, hsl(var(--kente-gold) / 0.6) 14px 16px), repeating-linear-gradient(-45deg, transparent 0 22px, hsl(var(--warm-cream) / 0.25) 22px 23px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <span className="brutal-eyebrow-light">Empindu Artisan Entry</span>
          <h1 className="brutal-h1 mt-6 max-w-4xl">
            A minimal path from <span className="text-accent italic">maker</span> registration to marketplace readiness.
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-warm-cream/80">
            Conversational, mobile-first onboarding for artisans, workshops, and registered craft businesses.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ArtisanOnboardingFlow />
      </div>
    </div>
  );
}
