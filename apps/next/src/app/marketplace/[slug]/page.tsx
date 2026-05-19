'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, Product } from '@/lib/api';
import { Heart, Share2, Truck, Gift, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Page() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProduct(slug);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-8">
          <div className="h-96 bg-muted border-2 border-foreground"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted w-1/2"></div>
            <div className="h-4 bg-muted w-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="border-2 border-foreground bg-card p-8 space-y-4">
            <h1 className="font-display text-2xl text-secondary">Product not found</h1>
            <p className="text-muted-foreground">{error || 'This product does not exist.'}</p>
            <Link
              href="/marketplace"
              className="inline-block border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-widest text-secondary-foreground hover:bg-secondary/90"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const mainImage = product.photos[mainImageIdx]?.url || '';
  const totalPrice = product.price_ugx * quantity;

  return (
    <section className="bg-background text-foreground">
      {/* Product Header Navigation */}
      <div className="border-b-2 border-foreground px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/artisans/${product.artisan.slug}`} className="hover:text-foreground">
              {product.artisan.full_name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12"
          >
            {/* Image Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                key={mainImageIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-square border-2 border-foreground overflow-hidden bg-muted"
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {product.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.photos.slice(0, 4).map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImageIdx(idx)}
                      className={`aspect-square border-2 overflow-hidden bg-muted transition-all ${
                        mainImageIdx === idx ? 'border-secondary' : 'border-foreground opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`View ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info & Purchase */}
            <div className="space-y-6">
              {/* Price & Header */}
              <div className="space-y-2">
                <p className="text-sm text-secondary font-display tracking-widest uppercase">
                  {product.artisan.community}, {product.artisan.district}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="border-2 border-foreground bg-muted p-4 space-y-2">
                  <div className="flex items-baseline gap-4">
                    <p className="font-display text-4xl text-secondary font-bold">
                      UGX {product.price_ugx.toLocaleString()}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      ≈ ${(product.price_usd || 0).toFixed(2)} USD
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {product.stock} in stock · Ready to ship
                  </p>
                </div>
              </div>

              {/* Artisan Card */}
              <Link
                href={`/artisans/${product.artisan.slug}`}
                className="block border-2 border-foreground bg-card p-4 hover:shadow-brutal-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  {product.artisan.profile_photo_url && (
                    <img
                      src={product.artisan.profile_photo_url}
                      alt={product.artisan.full_name}
                      className="w-16 h-16 object-cover border-2 border-foreground"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-display tracking-widest uppercase">
                      Made by
                    </p>
                    <p className="font-display text-lg text-foreground font-bold">
                      {product.artisan.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.artisan.years_experience}+ years of experience
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </Link>

              {/* Quantity & Gift Options */}
              <div className="space-y-3">
                <div className="border-2 border-foreground p-4">
                  <label className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border-2 border-foreground w-10 h-10 flex items-center justify-center hover:bg-muted transition-all"
                    >
                      −
                    </button>
                    <span className="font-display text-2xl font-bold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="border-2 border-foreground w-10 h-10 flex items-center justify-center hover:bg-muted transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsGift(!isGift)}
                  className={`w-full flex items-center gap-2 border-2 px-4 py-4 min-h-[44px] font-display text-sm tracking-widest uppercase transition-all ${
                    isGift
                      ? 'border-secondary bg-secondary text-secondary-foreground'
                      : 'border-foreground hover:bg-muted'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  This is a gift
                </button>
              </div>

              {/* Impact Info */}
              <div className="border-2 border-foreground bg-secondary/10 p-4 space-y-2">
                <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                  Your impact
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{product.artisan.full_name} earns:</span>
                    <span className="font-bold text-secondary">UGX {(product.artisan_earnings_ugx * quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Heritage Fund:</span>
                    <span className="font-bold text-accent">UGX {(product.heritage_fund_ugx * quantity).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Every purchase directly supports this artisan and preserves their craft tradition.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full border-2 border-foreground bg-secondary px-6 py-4 font-display uppercase tracking-widest text-secondary-foreground hover:bg-secondary/90 transition-all text-lg">
                  Add to Cart
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`flex items-center justify-center gap-2 border-2 px-3 py-2 font-display text-xs tracking-widest uppercase transition-all ${
                      saved
                        ? 'border-secondary bg-secondary text-secondary-foreground'
                        : 'border-foreground hover:bg-muted'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    Save
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: product.name,
                          text: `Check out this piece by ${product.artisan.full_name} on Empindu`,
                          url: typeof window !== 'undefined' ? window.location.href : '',
                        });
                      }
                    }}
                    className="flex items-center justify-center gap-2 border-2 border-foreground px-3 py-2 font-display text-xs tracking-widest uppercase hover:bg-muted transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Story Section */}
          <div className="mt-16 border-t-2 border-foreground pt-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main Story */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-display text-3xl text-foreground mb-4 tracking-tight">
                    The Story Behind This Piece
                  </h2>
                  <p className="text-muted-foreground font-body leading-8 whitespace-pre-wrap text-lg">
                    {product.story}
                  </p>
                </div>

                {/* Provenance Block */}
                {product.provenance && (
                  <div className="border-2 border-foreground bg-card p-6 space-y-4">
                    <h3 className="font-display text-2xl text-secondary tracking-wide">
                      Provenance Record
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.material && (
                        <div className="border-l-2 border-secondary pl-4">
                          <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                            Material
                          </p>
                          <p className="font-body text-foreground mt-1">{product.material}</p>
                        </div>
                      )}

                      {product.technique && (
                        <div className="border-l-2 border-secondary pl-4">
                          <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                            Technique
                          </p>
                          <p className="font-body text-foreground mt-1">{product.technique}</p>
                        </div>
                      )}

                      {product.days_to_make && (
                        <div className="border-l-2 border-secondary pl-4">
                          <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                            Time to Make
                          </p>
                          <p className="font-body text-foreground mt-1">{product.days_to_make} days</p>
                        </div>
                      )}

                      {product.provenance?.craft_tradition && (
                        <div className="border-l-2 border-secondary pl-4">
                          <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                            Craft Tradition
                          </p>
                          <p className="font-body text-foreground mt-1">{product.provenance.craft_tradition}</p>
                        </div>
                      )}

                      {product.provenance?.gi_status && (
                        <div className="border-l-2 border-secondary pl-4">
                          <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                            Geographic Indication
                          </p>
                          <p className="font-body text-foreground mt-1">{product.provenance.gi_status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Info */}
              <div className="space-y-4">
                <div className="border-2 border-foreground bg-card p-6 space-y-4">
                  <h3 className="font-display text-lg text-foreground tracking-widest uppercase">
                    Shipping
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <Truck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">International</p>
                        <p className="text-muted-foreground">7-14 business days via DHL</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Truck className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Local (Uganda)</p>
                        <p className="text-muted-foreground">3-5 business days</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs font-display tracking-widest uppercase hover:bg-muted transition-all">
                    Calculate shipping
                  </button>
                </div>

                {/* Reviews Summary */}
                <div className="border-2 border-foreground bg-card p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-secondary fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(12 reviews)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Beautiful craftsmanship. Arrived safely and exceeded expectations."
                  </p>
                  <button className="w-full border-2 border-foreground bg-background px-3 py-2 text-xs font-display tracking-widest uppercase hover:bg-muted transition-all">
                    See all reviews
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-16 border-t-2 border-foreground pt-12">
            <h2 className="font-display text-3xl text-foreground mb-8 tracking-tight">
              More from {product.artisan.full_name}
            </h2>
            <p className="text-muted-foreground">Explore other pieces by this artisan →</p>
          </div>
        </div>
      </div>
    </section>
  );
}
