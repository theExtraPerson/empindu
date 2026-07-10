'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getArtisan, getProducts, Artisan, ProductList } from '@/lib/api';
import { Heart, MapPin, Award, TrendingUp, Share2, Clipboard, Info, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Params {
  slug: string;
}

export default function Page({ params }: { params: Params }) {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const craftTradition = artisan?.craft_tradition || null;

  const profileFields = useMemo(
    () =>
      artisan
        ? [
            { label: 'Slug', value: artisan.slug || 'pending' },
            { label: 'Profile ID', value: artisan.id },
            { label: 'Community', value: artisan.community || 'Unknown' },
            { label: 'District', value: artisan.district || 'Unknown' },
            { label: 'Certified', value: artisan.is_certified ? 'Yes' : 'No' },
            { label: 'Years experience', value: `${artisan.years_experience}+` },
            { label: 'Orders fulfilled', value: artisan.order_count?.toString() || '0' },
            { label: 'Total earnings', value: `UGX ${(artisan.total_earnings_ugx || 0).toLocaleString()}` },
            { label: 'Listings count', value: artisan.listings?.length?.toString() || '0' },
          ]
        : [],
    [artisan]
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch artisan details
        const artisanData = await getArtisan(params.slug);
        setArtisan(artisanData);

        // Fetch artisan's products
        const productsData = await getProducts({
          artisan_slug: params.slug,
          page_size: 12,
        });
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artisan profile');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-none border-2 border-foreground"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted w-1/2 rounded-none"></div>
              <div className="h-4 bg-muted w-full rounded-none"></div>
              <div className="h-4 bg-muted w-3/4 rounded-none"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !artisan) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-2 border-foreground bg-card p-8 space-y-4">
            <h1 className="font-display text-2xl text-secondary">Artisan not found</h1>
            <p className="text-muted-foreground">{error || 'This artisan profile does not exist.'}</p>
            <Link
              href="/artisans"
              className="inline-block border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-widest text-secondary-foreground hover:bg-secondary/90"
            >
              Back to Artisans
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <section className="bg-background text-foreground">
      {/* Hero */}
      <div className="relative border-b-4 border-foreground">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 sm:h-96 md:h-[520px] overflow-hidden"
        >
          {artisan.cover_photo_url ? (
            <img
              src={artisan.cover_photo_url}
              alt={artisan.full_name}
              className="w-full h-full object-cover grayscale"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-foreground/80 uppercase text-sm tracking-[0.35em]">
              no cover photo
            </div>
          )}
          <div className="absolute inset-0 bg-background/80" />
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="mx-auto max-w-6xl bg-background border-4 border-foreground p-6 sm:p-8 shadow-brutal">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-end">
              <div className="relative -mt-24">
                <div className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-foreground bg-muted overflow-hidden">
                  {artisan.profile_photo_url ? (
                    <img
                      src={artisan.profile_photo_url}
                      alt={artisan.full_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground uppercase text-xs tracking-[0.35em]">
                      profile
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">artisan profile</p>
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight uppercase">
                    {artisan.full_name}
                  </h1>
                  <p className="mt-2 text-sm font-display uppercase tracking-[0.45em] text-secondary">
                    {craftTradition?.name || 'Craft tradition'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  <span className="border-2 border-foreground px-3 py-2">{artisan.community}</span>
                  <span className="border-2 border-foreground px-3 py-2">{artisan.district}</span>
                  <span className="border-2 border-foreground px-3 py-2">{artisan.years_experience}+ yrs</span>
                  <span className="border-2 border-foreground px-3 py-2">
                    {artisan.is_certified ? 'certified' : 'not certified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
                  <div className="border-2 border-foreground bg-card p-4 uppercase tracking-[0.25em]">
                    <p className="text-muted-foreground text-[10px]">orders</p>
                    <p className="font-display text-2xl text-foreground">{artisan.order_count}</p>
                  </div>
                  <div className="border-2 border-foreground bg-card p-4 uppercase tracking-[0.25em]">
                    <p className="text-muted-foreground text-[10px]">earnings</p>
                    <p className="font-display text-2xl text-secondary">UGX {artisan.total_earnings_ugx.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`border-2 border-foreground px-4 py-3 uppercase tracking-[0.35em] font-display text-sm transition-all ${
                      saved ? 'bg-secondary text-secondary-foreground' : 'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {saved ? 'saved' : 'save'}
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: artisan.full_name,
                          text: `Check out ${artisan.full_name}'s artisan profile on Empindu`,
                          url: shareUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                      }
                    }}
                    className="border-2 border-foreground px-4 py-3 uppercase tracking-[0.35em] font-display text-sm hover:bg-muted transition-all"
                  >
                    share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <div className="border-4 border-foreground bg-card p-8 shadow-brutal">
              <h2 className="font-display text-3xl uppercase tracking-[0.35em] mb-6">about {artisan.full_name}</h2>
              <p className="text-muted-foreground leading-8 whitespace-pre-wrap">{artisan.bio || 'No biography available.'}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border-4 border-foreground bg-card p-8 shadow-brutal">
                <h3 className="font-display text-xl uppercase tracking-[0.35em] mb-4">craft tradition</h3>
                <p className="text-muted-foreground leading-7 mb-4">{craftTradition?.description || 'Craft story and heritage details will appear here soon.'}</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Info className="w-4 h-4" /> {craftTradition?.ethnic_group || 'Heritage community'}</div>
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {craftTradition?.region || 'Region to be confirmed'}</div>
                  {craftTradition?.gi_status && (
                    <div className="flex items-center gap-2"><Award className="w-4 h-4" /> GI status: {craftTradition.gi_status}</div>
                  )}
                </div>
              </div>

              <div className="border-4 border-foreground bg-card p-8 shadow-brutal">
                <h3 className="font-display text-xl uppercase tracking-[0.35em] mb-4">profile data</h3>
                <div className="grid gap-3">
                  {profileFields.map((field) => (
                    <div key={field.label} className="border-2 border-foreground p-4 bg-background">
                      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{field.label}</p>
                      <p className="font-display text-base text-foreground mt-2">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border-4 border-foreground bg-card p-8 shadow-brutal">
              <h3 className="font-display text-xl uppercase tracking-[0.35em] mb-4">artisan details</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="uppercase tracking-[0.35em] text-[10px]">location</p>
                  <p className="font-display mt-2 text-foreground">{artisan.community}, {artisan.district}</p>
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="uppercase tracking-[0.35em] text-[10px]">certification</p>
                  <p className="font-display mt-2 text-foreground">{artisan.is_certified ? 'Empindu certified' : 'Not certified'}</p>
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="uppercase tracking-[0.35em] text-[10px]">years of craft</p>
                  <p className="font-display mt-2 text-foreground">{artisan.years_experience}</p>
                </div>
                <div className="border-2 border-foreground p-4 bg-background">
                  <p className="uppercase tracking-[0.35em] text-[10px]">listings</p>
                  <p className="font-display mt-2 text-foreground">{artisan.listings?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="border-4 border-foreground bg-card p-8 shadow-brutal">
              <h3 className="font-display text-xl uppercase tracking-[0.35em] mb-4">shop</h3>
              <Link
                href={`/marketplace?artisan_slug=${params.slug}`}
                className="block border-2 border-foreground bg-secondary px-5 py-4 uppercase tracking-[0.35em] font-display text-sm text-secondary-foreground text-center hover:bg-secondary/90"
              >
                view artisan products
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-[0.35em]">available pieces</h2>
                <p className="text-sm text-muted-foreground">Crafted by {artisan.full_name}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-4 border-foreground bg-card shadow-brutal"
                >
                  <Link href={`/marketplace/${product.slug}`} className="block group h-full">
                    <div className="aspect-[3/4] overflow-hidden border-b-4 border-foreground bg-muted">
                      <img
                        src={product.hero_photo_url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-display text-xl uppercase tracking-[0.35em] text-foreground">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-6 mt-2 line-clamp-3">
                          {product.story}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>price</span>
                          <span>UGX {product.price_ugx.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>artisan earn</span>
                          <span>UGX {product.artisan_earnings_ugx.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-6xl border-4 border-foreground bg-card p-12 text-center uppercase tracking-[0.35em] text-muted-foreground">
            <p>No active products available yet. Check back soon.</p>
          </div>
        </div>
      )}

      <div className="border-t-4 border-foreground px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row">
          <Link
            href="/artisans"
            className="flex-1 border-2 border-foreground bg-background px-6 py-4 text-center uppercase tracking-[0.35em] font-display hover:bg-muted"
          >
            ← back to artisans
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 border-2 border-foreground bg-background px-6 py-4 text-center uppercase tracking-[0.35em] font-display hover:bg-muted"
          >
            browse marketplace →
          </Link>
        </div>
      </div>
    </section>
  );
}
