'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MarketplacePagination({
  page,
  hasMore,
}: {
  page: number;
  hasMore: boolean;
}) {
  const params = useSearchParams();

  const build = (p: number) => {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete('page');
    else next.set('page', String(p));
    const qs = next.toString();
    return `/marketplace${qs ? `?${qs}` : ''}`;
  };

  return (
    <nav
      aria-label="Marketplace pagination"
      className="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6"
    >
      {page > 1 ? (
        <Link
          href={build(page - 1)}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2 font-display text-xs uppercase tracking-[0.25em] shadow-brutal-sm transition-transform hover:-translate-y-0.5"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Link>
      ) : (
        <span aria-hidden />
      )}

      <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Page {page}
      </span>

      {hasMore ? (
        <Link
          href={build(page + 1)}
          className="inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 font-display text-xs uppercase tracking-[0.25em] text-primary-foreground shadow-brutal-sm transition-transform hover:-translate-y-0.5"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
