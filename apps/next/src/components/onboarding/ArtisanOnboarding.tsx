'use client';

import { ArtisanOnboardingFlow } from './ArtisanOnboardingFlow';

export function ArtisanOnboarding() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Empindu artisan entry</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              A minimal path from maker registration to marketplace readiness.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Conversational, mobile-first onboarding for artisans, workshops, and registered craft businesses.
            </p>
          </div>

        </div>

        <ArtisanOnboardingFlow />
      </div>
    </div>
  );
}
