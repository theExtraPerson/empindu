'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getArtisan, getProducts, Artisan, ProductList } from '@/lib/api';
import { Heart, MapPin, Award, TrendingUp, Share2 } from 'lucide-react';
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
      {/* Hero with Artisan at Work */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-72 sm:h-96 md:h-[500px] overflow-hidden border-b-2 border-foreground"
        >
          {artisan.cover_photo_url ? (
            <img
              src={artisan.cover_photo_url}
              alt={artisan.full_name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-secondary/20 to-background flex items-center justify-center">
              <p className="text-muted-foreground">No cover photo</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </motion.div>

        {/* Artisan Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Profile Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative -mt-20 sm:-mt-32 md:-mt-40"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 border-background bg-muted rounded-none overflow-hidden">
                  {artisan.profile_photo_url ? (
                    <img
                      src={artisan.profile_photo_url}
                      alt={artisan.full_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Photo
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name & Quick Info */}
              <div className="flex-1 space-y-3 pb-2">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
                    {artisan.full_name}
                  </h1>
                  <p className="text-lg text-secondary font-display tracking-wide">
                    {artisan.craft_tradition.name || 'Artisan'}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{artisan.community}, {artisan.district}</span>
                  </div>
                  {artisan.is_certified && (
                    <div className="flex items-center gap-2 text-secondary font-semibold">
                      <Award className="w-4 h-4" />
                      <span>Empindu Certified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{artisan.order_count} orders fulfilled</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`flex items-center gap-2 border-2 border-foreground px-4 py-3 min-h-[44px] font-display text-sm uppercase tracking-widest transition-all ${
                      saved
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
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
                    className="flex items-center gap-2 border-2 border-foreground px-4 py-3 min-h-[44px] font-display text-sm uppercase tracking-widest hover:bg-muted transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artisan Story & Details */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b-2 border-foreground">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Main Story */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-foreground mb-4 tracking-tight">
                  The Artisan
                </h2>
                <p className="text-muted-foreground font-body leading-8 whitespace-pre-wrap">
                  {artisan.bio || `${artisan.full_name} is a skilled artisan specializing in ${artisan.craft_tradition.name} from ${artisan.community}, ${artisan.district}. With ${artisan.years_experience} years of experience, their work carries the traditions and cultural knowledge of their craft lineage.`}
                </p>
              </div>

              {/* Craft Tradition */}
              <div className="border-2 border-foreground bg-card p-6 space-y-3">
                <h3 className="font-display text-xl text-secondary tracking-wide">
                  {artisan.craft_tradition.name}
                </h3>
                <p className="text-muted-foreground font-body leading-7">
                  {artisan.craft_tradition.description}
                </p>
                {artisan.craft_tradition.gi_status && (
                  <p className="text-sm text-secondary font-semibold">
                    🏛️ Geographic Indication Status: {artisan.craft_tradition.gi_status}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Ethnic tradition: {artisan.craft_tradition.ethnic_group} • Region: {artisan.craft_tradition.region}
                </p>
              </div>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-4">
              <div className="border-2 border-foreground bg-card p-6 space-y-4">
                <h3 className="font-display text-lg text-foreground uppercase tracking-widest">
                  Impact
                </h3>

                <div className="space-y-3">
                  <div className="border-2 border-foreground bg-background p-4">
                    <p className="text-muted-foreground text-xs font-display tracking-widest uppercase">
                      Total Earnings
                    </p>
                    <p className="font-display text-2xl text-secondary mt-1">
                      UGX {artisan.total_earnings_ugx.toLocaleString()}
                    </p>
                  </div>

                  <div className="border-2 border-foreground bg-background p-4">
                    <p className="text-muted-foreground text-xs font-display tracking-widest uppercase">
                      Orders Fulfilled
                    </p>
                    <p className="font-display text-2xl text-primary mt-1">
                      {artisan.order_count}
                    </p>
                  </div>

                  <div className="border-2 border-foreground bg-background p-4">
                    <p className="text-muted-foreground text-xs font-display tracking-widest uppercase">
                      Years Active
                    </p>
                    <p className="font-display text-2xl text-foreground mt-1">
                      {artisan.years_experience}+
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-body leading-6">
                  Every purchase directly supports this artisan and contributes to preserving their craft tradition.
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`/marketplace?artisan_slug=${params.slug}`}
                className="w-full block border-2 border-foreground bg-secondary px-6 py-3 text-center font-display uppercase tracking-widest text-secondary-foreground hover:bg-secondary/90 transition-all"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl text-foreground mb-8 tracking-tight">
              Available Pieces
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    href={`/marketplace/${product.slug}`}
                    className="group border-2 border-foreground bg-card hover:shadow-brutal-lg transition-all h-full flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-foreground">
                      <img
                        src={product.hero_photo_url || ''}
                        alt={product.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4 flex flex-col gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-secondary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                          {product.story}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-foreground/30 pt-3">
                        <div>
                          <p className="text-muted-foreground text-[10px] font-display uppercase tracking-widest">
                            You Pay
                          </p>
                          <p className="font-display text-base font-bold">
                            UGX {product.price_ugx.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-display uppercase tracking-widest">
                            They Earn
                          </p>
                          <p className="font-display text-base font-bold text-secondary">
                            UGX {product.artisan_earnings_ugx.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Products */}
      {products.length === 0 && !loading && (
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-muted-foreground font-body">
              {artisan.full_name} does not have any active listings right now. Check back soon!
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="border-t-2 border-foreground px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row gap-4">
          <Link
            href="/artisans"
            className="flex-1 border-2 border-foreground bg-background px-6 py-3 text-center font-display uppercase tracking-widest text-foreground hover:bg-muted transition-all"
          >
            ← Back to All Artisans
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 border-2 border-foreground bg-background px-6 py-3 text-center font-display uppercase tracking-widest text-foreground hover:bg-muted transition-all"
          >
            Browse All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
