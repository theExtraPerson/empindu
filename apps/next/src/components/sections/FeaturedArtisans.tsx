'use client';

import { Link } from "@/lib/router-compat";
import { ArrowRight, MapPin, Hammer, CheckCircle, Package, ShoppingBag, Loader2, Star } from "lucide-react";
import { useFeaturedArtisans } from "@/hooks/useFeaturedArtisans";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

export function FeaturedArtisans() {
  const { artisans, loading } = useFeaturedArtisans(4);

  return (
    <section className="py-16 md:py-24 bg-muted border-y-2 border-foreground ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-6">
        {/* Brutalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="animate-weave-in opacity-0">
            <span className="inline-block border-2 border-primary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground">
              Meet the Makers
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl leading-tight">
            Featured <span className="text-primary">Artisans</span>
        </h1>
          </div>

          <div className="animate-weave-in opacity-0 [animation-delay:100ms]">
            <Link 
              to="/artisans"
              className="group inline-flex min-h-[44px] items-center gap-3 px-6 py-3 bg-foreground text-background font-display text-sm tracking-wider border-2 border-foreground hover:bg-primary hover:border-primary transition-all duration-300 shadow-brutal"
            >
              VIEW ALL
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 font-display text-sm tracking-wider text-muted-foreground">
              LOADING ARTISANS...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && artisans.length === 0 && (
          <div className="animate-weave-in py-20 text-center bg-background border-2 border-foreground shadow-brutal">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              NO ARTISANS YET
            </h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto">
              Be the first to join our community of skilled craftspeople.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex min-h-[44px] items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground font-display text-sm tracking-wider border-2 border-foreground shadow-brutal hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              BECOME AN ARTISAN
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Artisan Cards */}
        {!loading && artisans.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {artisans.map((artisan, index) => (
              <div
                key={artisan.slug}
                className="group animate-weave-in opacity-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link to={`/artisans/${artisan.slug}`}>
                  <div className="relative bg-background border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all duration-300 hover:-translate-y-2 hover:rotate-0">
                    {/* Verified Badge */}
                    {artisan.is_verified && (
                      <div className="absolute -top-2 -right-2 z-10 bg-accent text-accent-foreground px-2 py-1 font-display text-[10px] md:text-xs tracking-wider border-2 border-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        VERIFIED
                      </div>
                    )}

                    {/* Experience Badge (fallback if not verified) */}
                    {!artisan.is_verified && artisan.years_experience && (
                      <div className="absolute -top-2 -right-2 z-10 bg-secondary text-secondary-foreground px-2 py-1 font-display text-[10px] md:text-xs tracking-wider border-2 border-foreground">
                        {artisan.years_experience}+ YRS
                      </div>
                    )}

                    {/* Image Container */}
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={artisan.avatar_url || artisanPortrait.src}
                        alt={artisan.full_name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        onError={(e) => {
                          e.currentTarget.src = artisanPortrait.src;
                        }}
                      />
                      {/* Overlay Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
                      
                      {/* Craft Badge - Bottom Left */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                        {artisan.craft_specialty && (
                          <div className="flex items-center gap-1 text-background/80 mb-1">
                            <Hammer className="h-3 w-3" />
                            <span className="font-display text-[10px] md:text-xs tracking-wider uppercase">
                              {artisan.craft_specialty}
                            </span>
                          </div>
                        )}
                        <h3 className="font-display text-sm md:text-lg font-bold text-background leading-tight uppercase">
                          {artisan.full_name}
                        </h3>
                        {artisan.location && (
                          <div className="flex items-center gap-1 text-background/60 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-display text-[10px] md:text-xs tracking-wider">
                              {artisan.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Stats Bar */}
                    <div className="p-2 md:p-3 border-t-2 border-foreground bg-muted flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {artisan.avg_rating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-[hsl(var(--kente-gold))] text-[hsl(var(--kente-gold))]" />
                            <span className="font-display text-[10px] md:text-xs text-foreground">
                              {artisan.avg_rating}
                            </span>
                            <span className="font-display text-[10px] text-muted-foreground">
                              ({artisan.review_count})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="font-display text-[10px] md:text-xs text-foreground">
                            {artisan.product_count}
                          </span>
                        </div>
                        {artisan.total_sales > 0 && (
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                            <span className="font-display text-[10px] md:text-xs text-foreground">
                              {artisan.total_sales}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="w-6 h-6 md:w-8 md:h-8 bg-foreground text-background flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                        <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
