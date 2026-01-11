import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Hammer } from "lucide-react";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

const featuredArtisans = [
  {
    id: 1,
    name: "SARAH NAKATO",
    craft: "BASKET WEAVING",
    region: "Kampala",
    image: artisanPortrait,
    products: 47,
    experience: "15+",
  },
  {
    id: 2,
    name: "JAMES OKELLO",
    craft: "WOODCARVING",
    region: "Gulu",
    image: artisanPortrait,
    products: 32,
    experience: "20+",
  },
  {
    id: 3,
    name: "GRACE AUMA",
    craft: "BARKCLOTH",
    region: "Masaka",
    image: artisanPortrait,
    products: 28,
    experience: "12+",
  },
  {
    id: 4,
    name: "PETER MUTEBI",
    craft: "POTTERY",
    region: "Mbarara",
    image: artisanPortrait,
    products: 55,
    experience: "25+",
  },
];

export function FeaturedArtisans() {
  return (
    <section className="py-16 md:py-24 bg-warm-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brutalist Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display text-xs tracking-[0.3em] text-bark-brown/60 mb-3 block">
              [ MEET THE MAKERS ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-mudcloth-black tracking-tight leading-none">
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
              className="group inline-flex items-center gap-3 px-6 py-3 bg-mudcloth-black text-warm-cream font-display text-sm tracking-wider border-2 border-mudcloth-black hover:bg-transparent hover:text-mudcloth-black transition-all duration-300"
            >
              VIEW ALL
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Floating Artisan Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {featuredArtisans.map((artisan, index) => (
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
              <Link to={`/artisans/${artisan.id}`}>
                <div className="relative bg-white border-2 border-mudcloth-black shadow-brutal hover:shadow-brutal-lg transition-all duration-300 hover:-translate-y-2 hover:rotate-0">
                  {/* Floating Tag */}
                  <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground px-2 py-1 font-display text-[10px] md:text-xs tracking-wider border border-mudcloth-black">
                    {artisan.experience} YRS
                  </div>

                  {/* Image Container */}
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img
                      src={artisan.image}
                      alt={artisan.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                    />
                    {/* Overlay Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-t from-mudcloth-black/90 via-mudcloth-black/20 to-transparent" />
                    
                    {/* Craft Badge - Bottom Left */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <div className="flex items-center gap-1 text-warm-cream/80 mb-1">
                        <Hammer className="h-3 w-3" />
                        <span className="font-display text-[10px] md:text-xs tracking-wider">
                          {artisan.craft}
                        </span>
                      </div>
                      <h3 className="font-display text-sm md:text-lg font-bold text-warm-cream leading-tight">
                        {artisan.name}
                      </h3>
                      <div className="flex items-center gap-1 text-warm-cream/60 mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="font-mono text-[10px] md:text-xs">
                          {artisan.region}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Bar */}
                  <div className="p-2 md:p-3 border-t-2 border-mudcloth-black bg-warm-cream flex items-center justify-between">
                    <span className="font-mono text-[10px] md:text-xs text-bark-brown">
                      {artisan.products} ITEMS
                    </span>
                    <span className="w-6 h-6 md:w-8 md:h-8 bg-mudcloth-black text-warm-cream flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                    </span>
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
