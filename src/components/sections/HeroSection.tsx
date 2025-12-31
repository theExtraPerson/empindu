import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Users, ShoppingBag, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCrafts from "@/assets/hero-crafts.jpg";

const stats = [
  { label: "Artisans", value: "1,000+", icon: Users },
  { label: "Products", value: "5,000+", icon: ShoppingBag },
  { label: "Awards", value: "50+", icon: Award },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroCrafts}
          alt="Ugandan crafts collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mudcloth-black/90 via-mudcloth-black/70 to-mudcloth-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-mudcloth-black/80 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-gentle-float" />
      <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: "-3s" }} />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-secondary text-sm font-medium">Uganda Crafts Week 2025</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-warm-cream mb-6 leading-tight"
          >
            Handcrafted{" "}
            <span className="text-gradient-gold">Heritage</span>
            <br />
            from the Pearl of Africa
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-warm-cream/80 mb-8 max-w-xl leading-relaxed"
          >
            Discover authentic Ugandan artistry. Connect directly with master 
            craftspeople creating barkcloth, baskets, pottery, and more using 
            centuries-old techniques.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/marketplace">
                Explore Marketplace
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline-light" size="xl" className="group">
              <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Story
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-warm-cream">
                    {stat.value}
                  </p>
                  <p className="text-warm-cream/60 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-warm-cream/60">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-warm-cream/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-2.5 bg-secondary rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
