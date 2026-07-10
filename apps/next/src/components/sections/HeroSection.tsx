"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

// Mobile-first, low-bandwidth hero preserving the Empindu theme.
export function HeroSection() {
  return (
    <section className="relative w-full bg-bark-brown text-warm-cream">
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

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-10">
        <div className="max-w-2xl">
          <p className="inline-block border-2 border-primary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground">
            Authentic handmade crafts
          </p>
          <h1 className="mt-3 font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
            Stories carried in every basket, every thread, and every hand-finished piece.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-warm-cream/90">
            Discover Ugandan craft with provenance, visible makers, and a gifting experience designed to feel as meaningful as the piece itself.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="inline-flex min-h-[44px] items-center justify-center rounded border border-warm-cream bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-secondary-foreground"
            >
              Shop the collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/artisans"
              className="inline-flex min-h-[44px] items-center justify-center rounded border border-warm-cream bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-warm-cream"
            >
              Meet the makers
            </Link>
          </div>
        </div>

        <div className="rounded border border-warm-cream/40 bg-bark-brown/70 p-4 shadow-brutal sm:min-w-[280px]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Why buyers choose Empindu</p>
          <ul className="mt-3 space-y-2 text-sm text-warm-cream/90">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /> Transparent artisan stories and provenance</li>
            <li className="flex items-start gap-2"><HeartHandshake className="mt-0.5 h-4 w-4 text-primary" /> Gift-ready experiences with personal messages</li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 text-primary" /> Fast, mobile-first shopping with real impact</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

