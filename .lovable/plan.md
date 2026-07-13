## Goal

One frontend: keep `apps/next` (Next.js + Django backend), delete the legacy Vite shell, and repaint the Next.js UI with the original Lekton brutalist skin. Every route keeps its URL, CTA, and story-first narrative — but the data comes from the Django `/api/v1` endpoints via server components for SEO + SSR.

## Scope of change

### 1. Remove the second frontend
- Delete the legacy `src/` tree, root `vite.config.*`, root `index.html`, root `tailwind.config.*`, and root `package.json` bits that only exist to serve the old Vite build. Keep `src/integrations/supabase` only if anything in `apps/next` still imports it (audit and drop if unused).
- Root README / setup notes updated to point at `apps/next` + `backend/`.

### 2. Design system pass on `apps/next`
- `apps/next/src/app/globals.css`: reconcile tokens with the original palette (cream `#f6f3ec`, bark `#0d0c0c`, kente gold, copper, terracotta), restore the full clay + brutal shadow scale, keep Lekton (display) + DM Sans (body).
- `apps/next/tailwind.config.ts`: add back the missing shadow tokens (`brutal-sm`, `brutal-lg`, `clay-sm`, `clay-lg`, `soft`, `medium`, `strong`, `glow`, `gold`) referenced by components, plus `warm-cream` color used by hero/artisans.
- Ensure no component hardcodes hex — everything uses semantic tokens.

### 3. Repaint pages with the old brutalist look
Route-by-route (URLs unchanged):
- `/` — HeroSection (image + bark overlay) → MarketPlace intro → CraftCategories → FeaturedArtisans → ImpactDashboard (collapsible metrics) → ExhibitionCTA (Empindu Festival) → Partners → LazyTestimonials looping carousel.
- `/marketplace` — brutalist header card + 2-col mobile / 3-col desktop grid, disable grayscale hover on mobile.
- `/artisans` and `/artisans/[slug]` — public profile with story, products, reviews, like/visit/support/review CTAs.
- `/about` — story-first layout with team carousel.
- `/checkout` and `/gift-checkout` — brutalist stepper, sticky sidebar, MoMo + cash options.
- `/gifting` (corporate) — 4-step wizard styling.
- `/dashboard`, `/profile`, `/onboarding`, `/admin/*` — same brutalist card language.
- Header + Footer: preserved (already ported); ensure active-link state and mobile menu keep the old typography.

### 4. Django-backed SSR + SEO
- Introduce `apps/next/src/lib/server-api.ts`: server-only fetch helpers using `process.env.NEXT_PUBLIC_API_URL` (already used by `lib/api.ts`), with `next: { revalidate: 60 }` for catalog reads and `cache: 'no-store'` for auth-scoped calls.
- Convert data-heavy routes to **server components** that pre-fetch from Django and hand data to existing client components as props:
  - `/marketplace` → server-fetch `/api/v1/products/`
  - `/artisans` + `/artisans/[slug]` → server-fetch artisan list + detail
  - `/` featured artisans + testimonials → server-fetch
  - Interactive bits (cart, likes, gifting wizard, dashboard) stay client.
- Add `generateMetadata` per route (title, description, OG, twitter). Product and artisan detail pages emit JSON-LD (`Product`, `Person`, `Organization`) built from Django payloads.
- `apps/next/src/app/sitemap.ts` + `robots.ts` generated from the Django artisan/product lists.

### 5. Auth + write paths
- Keep NextAuth wiring; client mutations continue through `lib/api.ts` / `lib/auth-api.ts` against Django. No Supabase calls remain in `apps/next` after the audit.

### 6. Verification
- `bun run --cwd apps/next build` succeeds.
- Playwright visit `http://localhost:8080/`, `/marketplace`, `/artisans`, `/about`, screenshot each to confirm the brutalist skin renders and CTAs point to the right routes.
- View-source check on `/marketplace` and `/artisans/[slug]` to confirm product/artisan data is in the initial HTML (SSR) and metadata tags are populated.

## Out of scope
- No new features. No backend/Django changes. No route renames. No copy rewrites beyond restoring the old voice where placeholders exist.

## Technical notes
- `NEXT_PUBLIC_API_URL` must be set in `apps/next/.env` (already loaded by `next.config.mjs`). Server fetches use the same base.
- Where a Django endpoint is missing for something the old UI showed (e.g. testimonials), fall back to a typed static array in `lib/content.ts` rather than dummy inline data, so it's easy to swap later.
- `apps/next/src/app/page.module.css` is legacy CSS-module noise and will be removed once `page.tsx` uses only Tailwind.
