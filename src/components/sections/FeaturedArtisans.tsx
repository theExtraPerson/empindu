import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

const featuredArtisans = [
  {
    id: 1,
    name: "Sarah Nakato",
    craft: "Basket Weaving",
    region: "Kampala",
    image: artisanPortrait,
    products: 47,
    experience: "15+ years",
  },
  {
    id: 2,
    name: "James Okello",
    craft: "Woodcarving",
    region: "Gulu",
    image: artisanPortrait,
    products: 32,
    experience: "20+ years",
  },
  {
    id: 3,
    name: "Grace Auma",
    craft: "Barkcloth",
    region: "Masaka",
    image: artisanPortrait,
    products: 28,
    experience: "12+ years",
  },
  {
    id: 4,
    name: "Peter Mutebi",
    craft: "Pottery",
    region: "Mbarara",
    image: artisanPortrait,
    products: 55,
    experience: "25+ years",
  },
];

export function FeaturedArtisans() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredArtisans.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredArtisans.length) % featuredArtisans.length);
  };

  return (
    <section className="section-padding bg-gradient-warm pattern-weave">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
              Meet Our Makers
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Featured <span className="text-primary">Artisans</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="default" asChild>
              <Link to="/artisans">
                View All Artisans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Artisan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtisans.map((artisan, index) => (
            <motion.div
              key={artisan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/artisans/${artisan.id}`}>
                <div className="relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={artisan.image}
                      alt={artisan.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mudcloth-black/80 via-mudcloth-black/20 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary/90 text-secondary-foreground text-xs font-semibold mb-3">
                      {artisan.craft}
                    </span>
                    <h3 className="font-display text-xl font-bold text-warm-cream mb-1">
                      {artisan.name}
                    </h3>
                    <p className="text-warm-cream/70 text-sm mb-3">
                      {artisan.region} · {artisan.experience}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-warm-cream/60 text-sm">
                        {artisan.products} products
                      </span>
                      <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="h-4 w-4" />
                      </span>
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
