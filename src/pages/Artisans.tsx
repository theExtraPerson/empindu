import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Filter, 
  ArrowRight, 
  Star,
  CheckCircle
} from "lucide-react";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

const artisans = [
  {
    id: 1,
    name: "Sarah Nakato",
    craft: "Basket Weaving",
    region: "Kampala",
    image: artisanPortrait,
    products: 47,
    experience: "15+ years",
    verified: true,
    rating: 4.9,
  },
  {
    id: 2,
    name: "James Okello",
    craft: "Woodcarving",
    region: "Gulu",
    image: artisanPortrait,
    products: 32,
    experience: "20+ years",
    verified: true,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Grace Auma",
    craft: "Barkcloth",
    region: "Masaka",
    image: artisanPortrait,
    products: 28,
    experience: "12+ years",
    verified: true,
    rating: 4.9,
  },
  {
    id: 4,
    name: "Peter Mutebi",
    craft: "Pottery",
    region: "Mbarara",
    image: artisanPortrait,
    products: 55,
    experience: "25+ years",
    verified: true,
    rating: 5.0,
  },
  {
    id: 5,
    name: "Florence Akello",
    craft: "Jewelry",
    region: "Soroti",
    image: artisanPortrait,
    products: 89,
    experience: "10+ years",
    verified: true,
    rating: 4.7,
  },
  {
    id: 6,
    name: "Robert Ssempala",
    craft: "Textiles",
    region: "Jinja",
    image: artisanPortrait,
    products: 41,
    experience: "18+ years",
    verified: true,
    rating: 4.8,
  },
];

const craftTypes = [
  "All Crafts",
  "Basketry",
  "Barkcloth",
  "Woodcarving",
  "Pottery",
  "Jewelry",
  "Textiles",
];

const Artisans = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-earth pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-mudcloth opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream mb-6">
              Meet Our <span className="text-secondary">Artisans</span>
            </h1>
            <p className="text-warm-cream/80 text-lg mb-8">
              Connect with over 1,000 skilled craftspeople from across Uganda. 
              Each artisan brings generations of expertise and unique cultural heritage.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search artisans by name or craft..."
                  className="pl-12 h-12 bg-warm-cream/10 border-warm-cream/20 text-warm-cream placeholder:text-warm-cream/50"
                />
              </div>
              <Button variant="gold" size="lg">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Craft Type Filter */}
      <section className="py-6 border-b border-border bg-card sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {craftTypes.map((type, index) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans Grid */}
      <section className="section-padding bg-background pattern-weave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{artisans.length}</span> artisans
            </p>
            <select className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
              <option>Sort by: Featured</option>
              <option>Sort by: Rating</option>
              <option>Sort by: Products</option>
              <option>Sort by: Experience</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan, index) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/artisans/${artisan.id}`}>
                  <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 border border-border">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={artisan.image}
                        alt={artisan.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {artisan.verified && (
                        <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-mudcloth-black/70 text-warm-cream text-sm">
                        <Star className="h-3 w-3 fill-secondary text-secondary" />
                        {artisan.rating}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {artisan.name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mt-1">
                            {artisan.craft}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                        <MapPin className="h-4 w-4" />
                        {artisan.region}
                        <span className="text-border">•</span>
                        {artisan.experience}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-muted-foreground text-sm">
                          {artisan.products} products
                        </span>
                        <span className="flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          View Profile
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg">
              Load More Artisans
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Artisans;
