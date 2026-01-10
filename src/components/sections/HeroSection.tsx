import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import heroCrafts from "@/assets/hero-crafts.jpg";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-bark-brown">
      {/* Background Image with Parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroCrafts}
          alt="Ugandan crafts collection"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bark-brown/40 via-transparent to-bark-brown/80" />
      </motion.div>

      {/* Main Content - Massive Typography */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-0">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4"
        >
          {/* Giant Headline */}
          <h1 className="font-display text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] text-warm-cream">
            HANDCRAFTED
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="font-display text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw] leading-[0.9] text-secondary">
            HERITAGE
          </h1>
        </motion.div>
      </div>

      {/* Bottom Bar - Brutalist Info Strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 border-t-2 border-warm-cream/30 mt-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-warm-cream/30">
          {/* Stat 1 */}
          <div className="p-4 md:p-6 lg:p-8 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-display text-[10px] tracking-widest text-warm-cream/50 mb-2">ARTISANS</p>
            <p className="font-display text-3xl md:text-4xl text-warm-cream">1,000+</p>
          </div>

          {/* Stat 2 */}
          <div className="p-4 md:p-6 lg:p-8 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-display text-[10px] tracking-widest text-warm-cream/50 mb-2">PRODUCTS</p>
            <p className="font-display text-3xl md:text-4xl text-warm-cream">5,000+</p>
          </div>

          {/* Tagline */}
          <div className="p-4 md:p-6 lg:p-8 col-span-2 md:col-span-1 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-display text-[10px] tracking-widest text-warm-cream/50 mb-2">PEARL OF AFRICA</p>
            <p className="font-body text-sm text-warm-cream/70 leading-relaxed max-w-xs">
              Authentic Ugandan artistry. Centuries-old techniques.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/marketplace"
            className="p-4 md:p-6 lg:p-8 bg-secondary hover:bg-secondary/90 transition-all group flex flex-col justify-between border-l-2 border-secondary-foreground/20"
          >
            <p className="font-display text-[10px] tracking-widest text-secondary-foreground/60 mb-2">EXPLORE</p>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg md:text-xl text-secondary-foreground">SHOP NOW</span>
              <ArrowRight className="h-5 w-5 text-secondary-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute right-4 md:right-8 bottom-48 md:bottom-56 flex flex-col items-center gap-2"
      >
        <span className="font-display text-[10px] tracking-widest text-warm-cream/50 [writing-mode:vertical-rl]">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="h-4 w-4 text-warm-cream/50" />
        </motion.div>
      </motion.div>

      {/* Decorative Claymorphic Elements */}
      <div className="absolute top-1/4 left-8 md:left-16 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-16 h-16 md:w-24 md:h-24 rounded-organic bg-gradient-to-br from-secondary/40 to-clay-medium/30 shadow-clay animate-gentle-float"
        />
      </div>

      <div className="absolute top-1/3 right-12 md:right-24 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-12 h-12 md:w-20 md:h-20 rounded-organic-alt bg-gradient-to-tr from-clay-light/40 to-accent/20 shadow-clay animate-gentle-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      {/* Top-right badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute top-24 right-4 md:right-8 z-10"
      >
        <div className="px-4 py-3 border-2 border-warm-cream/30 bg-bark-brown/80 backdrop-blur-sm">
          <p className="font-display text-[10px] tracking-widest text-secondary">NOW OPEN</p>
          <p className="font-display text-sm text-warm-cream">UGANDA CRAFTS WEEK 2025</p>
        </div>
      </motion.div>
    </section>
  );
}
