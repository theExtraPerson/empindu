'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Hammer, MapPin, Search, X } from 'lucide-react';
import artisanPortrait from '@/assets/artisan-portrait.jpg';
import type { ArtisanSummary } from '@/lib/api';

type Tradition = { id: number; name: string; region: string };

type Initial = {
  q: string;
  craft: string;
  region: string;
  certified: string;
};

export function ArtisanDirectory({
  all,
  traditions,
  page,
  pageSize,
  initial,
}: {
  all: ArtisanSummary[];
  traditions: Tradition[];
  page: number;
  pageSize: number;
  initial: Initial;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = initial.q.trim().toLowerCase();
    if (!q) return all;
    return all.filter((a) =>
      [a.full_name, a.community, a.district, a.craft_tradition]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q)),
    );
  }, [all, initial.q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const buildHref = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    return `/artisans${qs ? `?${qs}` : ''}`;
  };

  const applyForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    const q = String(form.get('q') || '');
    const craft = String(form.get('craft') || '');
    const region = String(form.get('region') || '');
    const certified = form.get('certified') ? '1' : '';
    if (q) next.set('q', q);
    if (craft) next.set('craft', craft);
    if (region) next.set('region', region);
    if (certified) next.set('certified', certified);
    startTransition(() =>
      router.push(`/artisans${next.toString() ? `?${next}` : ''}`),
    );
  };

  const regions = Array.from(new Set(traditions.map((t) => t.region).filter(Boolean)));
  const hasActive = initial.q || initial.craft || initial.region || initial.certified;
  const portraitFallback =
    typeof artisanPortrait === 'string' ? artisanPortrait : artisanPortrait.src;

  return (
    <div className="space-y-6">
      <form
        onSubmit={applyForm}
        className="border-2 border-foreground bg-background p-4 shadow-brutal sm:p-5"
        aria-label="Filter artisans"
      >
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
          <label className="flex items-center gap-2 border-2 border-foreground bg-muted px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              name="q"
              defaultValue={initial.q}
              placeholder="Search maker, community, craft"
              className="w-full bg-transparent font-body text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </label>
          <select
            name="craft"
            defaultValue={initial.craft}
            className="border-2 border-foreground bg-muted px-3 py-2 font-display text-xs uppercase tracking-[0.2em]"
            aria-label="Craft tradition"
          >
            <option value="">All crafts</option>
            {traditions.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            name="region"
            defaultValue={initial.region}
            className="border-2 border-foreground bg-muted px-3 py-2 font-display text-xs uppercase tracking-[0.2em]"
            aria-label="Region"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 border-2 border-foreground bg-muted px-3 py-2 font-display text-xs uppercase tracking-[0.2em]">
            <input
              type="checkbox"
              name="certified"
              defaultChecked={initial.certified === '1'}
              className="h-4 w-4 border-2 border-foreground accent-primary"
            />
            Certified
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center border-2 border-foreground bg-primary px-4 py-2 font-display text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? 'Applying' : 'Apply'}
          </button>
        </div>
        {hasActive ? (
          <Link
            href="/artisans"
            className="mt-3 inline-flex items-center gap-2 border-b-2 border-foreground/50 font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear all filters
          </Link>
        ) : null}
      </form>

      <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/40 pb-3 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        <span>{filtered.length} makers</span>
        <span>
          Page {currentPage} / {totalPages}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="border-2 border-foreground bg-card p-10 text-center shadow-brutal">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            No makers match those filters yet. Try widening the search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a, idx) => (
            <Link
              key={a.slug}
              href={`/artisans/${a.slug}`}
              className="group animate-weave-in opacity-0 border-2 border-foreground bg-background shadow-brutal transition-all duration-300 hover:-translate-y-1 hover:shadow-brutal-lg"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={a.profile_photo_url || portraitFallback}
                  alt={a.full_name}
                  loading={idx < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/10 to-transparent" />
                {a.is_certified ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 border-2 border-foreground bg-accent px-2 py-1 font-display text-[10px] uppercase tracking-[0.2em] text-accent-foreground">
                    <CheckCircle className="h-3 w-3" aria-hidden /> Verified
                  </span>
                ) : null}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-lg uppercase tracking-wide text-background">
                    {a.full_name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-background/80">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {[a.community, a.district].filter(Boolean).join(', ') || 'Uganda'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t-2 border-foreground bg-muted px-3 py-2 font-display text-[11px] uppercase tracking-[0.22em]">
                <span className="inline-flex items-center gap-1 text-foreground">
                  <Hammer className="h-3 w-3" aria-hidden />
                  {a.craft_tradition || 'Heritage craft'}
                </span>
                <span className="text-muted-foreground">
                  {a.years_experience ? `${a.years_experience}+ yrs` : 'New'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <nav
        aria-label="Artisan pagination"
        className="flex items-center justify-between border-t-2 border-foreground pt-6"
      >
        {currentPage > 1 ? (
          <Link
            href={buildHref({ page: String(currentPage - 1) })}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 font-display text-xs uppercase tracking-[0.25em] shadow-brutal-sm transition-transform hover:-translate-y-0.5"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
          </Link>
        ) : (
          <span aria-hidden />
        )}
        <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Page {currentPage} / {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildHref({ page: String(currentPage + 1) })}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 font-display text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </nav>
    </div>
  );
}
