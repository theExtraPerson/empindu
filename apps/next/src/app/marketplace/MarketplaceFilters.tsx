'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

type Tradition = { id: number; name: string; region: string };

type Initial = {
  q: string;
  craft: string;
  region: string;
  min: string;
  max: string;
};

export function MarketplaceFilters({
  initial,
  traditions,
}: {
  initial: Initial;
  traditions: Tradition[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete('page');
    startTransition(() => router.push(`/marketplace?${next.toString()}`));
  };

  const clearAll = () =>
    startTransition(() => router.push('/marketplace'));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setParam({
      q: String(form.get('q') || ''),
      craft: String(form.get('craft') || ''),
      region: String(form.get('region') || ''),
      min: String(form.get('min') || ''),
      max: String(form.get('max') || ''),
    });
  };

  const regions = Array.from(
    new Set(traditions.map((t) => t.region).filter(Boolean)),
  );

  const hasActive =
    initial.q || initial.craft || initial.region || initial.min || initial.max;

  return (
    <form
      onSubmit={onSubmit}
      className="border-2 border-foreground bg-background p-4 shadow-brutal sm:p-5"
      aria-label="Filter marketplace"
    >
      <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_0.7fr_0.7fr_auto]">
        <label className="flex items-center gap-2 border-2 border-foreground bg-muted px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={initial.q}
            placeholder="Search by name or story"
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

        <input
          name="min"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={initial.min}
          placeholder="Min $"
          className="border-2 border-foreground bg-muted px-3 py-2 font-display text-xs uppercase tracking-[0.2em] placeholder:text-muted-foreground"
          aria-label="Minimum price USD"
        />
        <input
          name="max"
          type="number"
          min="0"
          inputMode="numeric"
          defaultValue={initial.max}
          placeholder="Max $"
          className="border-2 border-foreground bg-muted px-3 py-2 font-display text-xs uppercase tracking-[0.2em] placeholder:text-muted-foreground"
          aria-label="Maximum price USD"
        />

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 border-2 border-foreground bg-primary px-4 py-2 font-display text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {pending ? 'Applying' : 'Apply'}
        </button>
      </div>

      {hasActive ? (
        <button
          type="button"
          onClick={clearAll}
          className="mt-3 inline-flex items-center gap-2 border-b-2 border-foreground/50 font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" aria-hidden />
          Clear all filters
        </button>
      ) : null}
    </form>
  );
}
