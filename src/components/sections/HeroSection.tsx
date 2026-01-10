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
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-mudcloth-black">
      {/* Background Image with Parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroCrafts}
          alt="Ugandan crafts collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-mudcloth-black/40" />
      </motion.div>

      {/* Main Content - Massive Typography */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Giant Headline */}
          <h1 className="font-display text-[12vw] sm:text-[14vw] md:text-[12vw] lg:text-[11vw] leading-[0.85] font-bold text-warm-cream uppercase tracking-tight">
            Handcrafted
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex items-end gap-4 md:gap-8"
        >
          <h1 className="font-display text-[12vw] sm:text-[14vw] md:text-[12vw] lg:text-[11vw] leading-[0.85] font-bold text-secondary uppercase tracking-tight">
            Heritage
          </h1>
        </motion.div>
      </div>

      {/* Bottom Bar - Brutalist Info Strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="relative z-10 border-t border-warm-cream/20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-warm-cream/20">
          {/* Stat 1 */}
          <div className="p-4 md:p-6 lg:p-8 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-widest text-warm-cream/60 mb-2">Artisans</p>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-cream">1,000+</p>
          </div>

          {/* Stat 2 */}
          <div className="p-4 md:p-6 lg:p-8 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-widest text-warm-cream/60 mb-2">Products</p>
            <p className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-cream">5,000+</p>
          </div>

          {/* Tagline */}
          <div className="p-4 md:p-6 lg:p-8 col-span-2 md:col-span-1 group hover:bg-warm-cream/5 transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-widest text-warm-cream/60 mb-2">Pearl of Africa</p>
            <p className="font-body text-sm md:text-base text-warm-cream/80 leading-relaxed max-w-xs">
              Authentic Ugandan artistry. Centuries-old techniques.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/marketplace"
            className="p-4 md:p-6 lg:p-8 bg-secondary hover:bg-secondary/90 transition-all group flex flex-col justify-between"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-secondary-foreground/80 mb-2">Explore</p>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl md:text-2xl font-bold text-secondary-foreground">Shop Now</span>
              <ArrowRight className="h-5 w-5 text-secondary-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute right-4 md:right-8 bottom-32 md:bottom-40 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-warm-cream/60 [writing-mode:vertical-rl]">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="h-4 w-4 text-warm-cream/60" />
        </motion.div>
      </motion.div>

      {/* Decorative Claymorphic Elements */}
      <div className="absolute top-1/4 left-8 md:left-16 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-20 h-20 md:w-32 md:h-32 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-primary/30 to-secondary/20 backdrop-blur-sm shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),_0_8px_16px_rgba(0,0,0,0.2)] animate-gentle-float"
        />
      </div>

      <div className="absolute top-1/3 right-12 md:right-24 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-16 h-16 md:w-24 md:h-24 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-gradient-to-tr from-secondary/40 to-accent/20 backdrop-blur-sm shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3),_0_8px_16px_rgba(0,0,0,0.2)] animate-gentle-float"
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
        <div className="clay-card px-4 py-3 rounded-none border-2 border-warm-cream/30 bg-mudcloth-black/60 backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-widest text-secondary">Now Open</p>
          <p className="font-display text-sm md:text-base text-warm-cream">Uganda Crafts Week 2025</p>
        </div>
      </motion.div>
    </section>
  );
}
