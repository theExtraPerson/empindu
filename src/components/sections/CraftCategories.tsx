import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import heroCrafts from "@/assets/hero-crafts.jpg";
import artisanPortrait from "@/assets/artisan-portrait.jpg";
import patternBg from "@/assets/pattern-bg.jpg";

import basketryImg from "/ebitemere.jpg";
import barkclothImg from "/barkcloth.jpg";
import woodworkImg from "/woodworking.jpg";
import potteryImg from "/pottery.jpg";
import beadworkImg from "/beadwork.jpg";
import textilesImg from "/textiles.jpg";

const categories = [
  {
    id: "basketry",
    name: "BASKETRY",
    description: "Hand-woven with intricate patterns",
    count: 340,
    image: basketryImg,
  },
  {
    id: "barkcloth",
    name: "BARKCLOTH",
    description: "Traditional Ugandan textile art",
    count: 156,
    image: barkclothImg,
  },
  {
    id: "woodcarving",
    name: "WOODCARVING",
    description: "Sculptural art from local hardwoods",
    count: 278,
    image: woodworkImg,
  },
  {
    id: "pottery",
    name: "POTTERY",
    description: "Handcrafted clay vessels & decor",
    count: 189,
    image: potteryImg,
  },
  {
    id: "jewelry",
    name: "JEWELRY",
    description: "Beaded & metalwork adornments",
    count: 412,
    image: beadworkImg,
  },
  {
    id: "textiles",
    name: "TEXTILES",
    description: "Woven fabrics & embroidery",
    count: 223,
    image: textilesImg,
  },
];

export function CraftCategories() {
  return (
    <section className="py-16 md:py-24 bg-mudcloth-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brutalist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-display text-xs tracking-[0.3em] text-warm-cream/40 mb-3 block">
                [ EXPLORE BY CATEGORY ]
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream tracking-tight leading-none">
                CRAFT
                <br />
                <span className="text-primary">TYPES</span>
              </h2>
            </div>
            <p className="font-mono text-sm text-warm-cream/60 max-w-sm">
              Discover centuries-old techniques passed down through generations of Ugandan craftspeople.
            </p>
          </div>
        </motion.div>

        {/* Categories Grid with Image Backgrounds */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={`/marketplace?category=${category.id}`}
                className="group block relative overflow-hidden border-2 border-warm-cream/20 hover:border-primary transition-all duration-500"
              >
                {/* Background Image */}
                <div className="aspect-[4/5] md:aspect-[4/3] relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-700"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-mudcloth-black/70 group-hover:bg-mudcloth-black/50 transition-colors duration-500" />
                  
                  {/* Animated Corner Lines */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                    {/* Top - Count Badge */}
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] md:text-xs text-warm-cream/60 tracking-wider">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="bg-warm-cream/10 backdrop-blur-sm px-2 py-1 font-mono text-[10px] md:text-xs text-warm-cream border border-warm-cream/20">
                        {category.count}+
                      </span>
                    </div>
                    
                    {/* Bottom - Title & Description */}
                    <div>
                      <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-warm-cream mb-1 md:mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="font-mono text-[10px] md:text-xs text-warm-cream/60 mb-3 md:mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      
                      {/* Arrow Button */}
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[10px] md:text-xs tracking-wider text-warm-cream/40 group-hover:text-primary transition-colors">
                          EXPLORE
                        </span>
                        <span className="w-8 h-8 md:w-10 md:h-10 border border-warm-cream/30 flex items-center justify-center text-warm-cream group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:rotate-45">
                          <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
