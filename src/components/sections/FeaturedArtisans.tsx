import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Hammer, CheckCircle, Package, ShoppingBag, Loader2 } from "lucide-react";
import { useFeaturedArtisans } from "@/hooks/useFeaturedArtisans";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

export function FeaturedArtisans() {
  const { artisans, loading } = useFeaturedArtisans(4);

  return (
    <section className="py-16 md:py-24 bg-muted border-y-2 border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brutalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-3 block">
              [ MEET THE MAKERS ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
              FEATURED
              <br />
              <span className="text-primary">ARTISANS</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link 
              to="/artisans"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-foreground text-background font-display text-sm tracking-wider border-2 border-foreground hover:bg-primary hover:border-primary transition-all duration-300 shadow-brutal"
            >
              VIEW ALL
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-background border-2 border-foreground shadow-brutal"
          >
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              NO ARTISANS YET
            </h3>
            <p className="text-muted-foreground font-body max-w-md mx-auto">
              Be the first to join our community of skilled craftspeople.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-primary-foreground font-display text-sm tracking-wider border-2 border-foreground shadow-brutal hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              BECOME AN ARTISAN
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {/* Artisan Cards */}
        {!loading && artisans.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {artisans.map((artisan, index) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, y: 40, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="group"
                style={{ 
                  transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                <Link to={`/artisans/${artisan.user_id}`}>
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
                        src={artisan.avatar_url || artisanPortrait}
                        alt={artisan.full_name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = artisanPortrait;
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
