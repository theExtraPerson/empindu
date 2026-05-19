"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Mobile-first, low-bandwidth hero preserving the Empindu theme.
export function HeroSection() {
  return (
    <section className="relative w-full bg-bark-brown text-warm-cream">
      {/* Lightweight background: single image with lazy loading to save bandwidth */}
      <div className="relative h-56 w-full overflow-hidden bg-bark-brown sm:h-72 md:h-96">
        <Image
          src="/empinduu.jpg"
          alt="Handmade crafts"
          className="object-cover opacity-75"
          priority
          fill
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bark-brown/70 to-bark-brown" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-secondary/80">Authentic craft</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl leading-tight">
          Thrive with nature — preserve culture
        </h1>
        <p className="mt-3 text-sm text-warm-cream/90 max-w-xl">
          Handmade gifts from Ugandan artisans, optimized for fast mobile browsing and simple checkout.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/marketplace"
            className="inline-flex min-h-[44px] items-center justify-center rounded border border-warm-cream bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-secondary-foreground"
          >
            Shop
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            href="/gift-checkout"
            className="inline-flex min-h-[44px] items-center justify-center rounded border border-warm-cream bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-warm-cream"
          >
            Send Gift
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded p-3 bg-bark-brown/70 text-center">
            <div className="text-lg font-display text-secondary">47+</div>
            <div className="text-xs text-warm-cream/80">Artisans</div>
          </div>
          <div className="rounded p-3 bg-bark-brown/70 text-center">
            <div className="text-lg font-display text-primary">312+</div>
            <div className="text-xs text-warm-cream/80">Orders</div>
          </div>
          <div className="rounded p-3 bg-bark-brown/70 text-center">
            <div className="text-lg font-display text-accent">8</div>
            <div className="text-xs text-warm-cream/80">Countries</div>
          </div>
          <div className="rounded p-3 bg-bark-brown/70 text-center">
            <div className="text-lg font-display text-secondary">UGX 2.8M</div>
            <div className="text-xs text-warm-cream/80">Heritage Fund</div>
          </div>
        </div>
      </div>
    </section>
  );
}



