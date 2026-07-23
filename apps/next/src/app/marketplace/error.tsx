'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="min-h-[60vh] bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl border-2 border-destructive bg-card p-8 text-center shadow-brutal">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-destructive">
          Marketplace unavailable
        </p>
        <h2 className="mt-3 font-display text-2xl">Something disrupted the loom.</h2>
        <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
          We couldn&apos;t load products from the storyteller&apos;s workshop. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center border-2 border-foreground bg-primary px-5 py-2 font-display text-xs uppercase tracking-[0.3em] text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
