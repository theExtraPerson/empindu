'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Loader2, Send, Share2, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getMyArtisanDashboard, type ArtisanDashboard } from '@/lib/api';

export default function ProfilePage() {
  const { session, loading } = useAuth();
  const [dashboard, setDashboard] = useState<ArtisanDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!session?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setDashboard(await getMyArtisanDashboard(session.accessToken));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile.');
      } finally {
        setIsLoading(false);
      }
    }

    if (!loading) load();
  }, [loading, session?.accessToken]);

  const shareUrl = useMemo(() => {
    if (!dashboard) return '';
    if (typeof window === 'undefined') return dashboard.artisan.profile_url;
    return `${window.location.origin}${dashboard.artisan.profile_url}`;
  }, [dashboard]);

  const shareText = dashboard
    ? `${dashboard.artisan.full_name} on Empindu: ${dashboard.artisan.bio.slice(0, 140)}${dashboard.artisan.bio.length > 140 ? '...' : ''}`
    : '';

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-foreground/10 bg-card p-8 text-center shadow-clay">
          <h1 className="text-3xl font-bold">Sign in to view your profile hub</h1>
          <p className="mt-3 text-muted-foreground">Your shareable artisan profile is created after onboarding.</p>
          <Button asChild variant="earth" className="mt-6">
            <Link href="/auth?intent=artisan-publish&callbackUrl=/profile">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-foreground/10 bg-card p-8 text-center shadow-clay">
          <h1 className="text-3xl font-bold">No artisan profile yet</h1>
          <p className="mt-3 text-muted-foreground">Complete onboarding to get your public profile URL.</p>
          <Button asChild variant="earth" className="mt-6">
            <Link href="/onboarding">Start onboarding</Link>
          </Button>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[2rem] bg-mud text-primary shadow-clay">
          <div className="grid gap-6 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Shareable artisan profile</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{dashboard.artisan.full_name}</h1>
              <p className="mt-4 text-sm leading-7 text-primary/75">
                {dashboard.artisan.craft_tradition.name} from {dashboard.artisan.community}, {dashboard.artisan.district}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline-light">
                  <Link href={dashboard.artisan.profile_url}>
                    Open public page
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="gold"
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({ title: dashboard.artisan.full_name, text: shareText, url: shareUrl });
                    } else {
                      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                      setMessage('Share text copied.');
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-primary">Telegram-ready story card</p>
              <p className="mt-3 whitespace-pre-line rounded-2xl bg-primary p-4 text-sm leading-7 text-foreground">
                {shareText}
                {'\n\n'}
                {shareUrl}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost-light"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
                    setMessage('Telegram story card copied.');
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy card
                </Button>
                <Button asChild variant="ghost-light">
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer">
                    <Send className="h-4 w-4" />
                    Telegram
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {message ? <p className="mt-4 rounded-xl bg-gold/15 px-4 py-3 text-sm">{message}</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Products" value={dashboard.stats.products} />
          <Metric label="Orders" value={dashboard.stats.orders} />
          <Metric label="Earnings" value={`UGX ${Math.round(dashboard.stats.total_earnings_ugx).toLocaleString()}`} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Latest listings</h2>
              <p className="text-sm text-muted-foreground">New products are built for Telegram group and channel sharing.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Store className="h-4 w-4" />
                Manage
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {dashboard.products.slice(0, 3).map((product) => (
              <article key={product.id} className="rounded-2xl bg-muted/40 p-4">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  {product.hero_photo_url ? <img src={product.hero_photo_url} alt={product.name} className="h-full w-full object-cover" /> : null}
                </div>
                <h3 className="mt-3 font-bold">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">UGX {Math.round(product.price_ugx).toLocaleString()}</p>
                <a
                  className="mt-3 inline-flex text-sm font-semibold text-accent"
                  href={`https://t.me/share/url?url=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${product.slug}`)}&text=${encodeURIComponent(`New Empindu listing: ${product.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share listing
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-clay">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
