import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ShoppingBag,
  Heart,
  Star,
  ArrowRight
} from "lucide-react";
import heroCrafts from "@/assets/hero-crafts.jpg";

const products = [
  {
    id: 1,
    name: "Woven Raffia Basket",
    artisan: "Sarah Nakato",
    category: "Basketry",
    price: 85000,
    image: heroCrafts,
    rating: 4.9,
    reviews: 24,
    inStock: true,
  },
  {
    id: 2,
    name: "Carved Mahogany Bowl",
    artisan: "James Okello",
    category: "Woodcarving",
    price: 150000,
    image: heroCrafts,
    rating: 4.8,
    reviews: 18,
    inStock: true,
  },
  {
    id: 3,
    name: "Traditional Barkcloth Runner",
    artisan: "Grace Auma",
    category: "Barkcloth",
    price: 120000,
    image: heroCrafts,
    rating: 5.0,
    reviews: 32,
    inStock: true,
  },
  {
    id: 4,
    name: "Hand-painted Ceramic Vase",
    artisan: "Peter Mutebi",
    category: "Pottery",
    price: 95000,
    image: heroCrafts,
    rating: 4.7,
    reviews: 15,
    inStock: true,
  },
  {
    id: 5,
    name: "Beaded Necklace Set",
    artisan: "Florence Akello",
    category: "Jewelry",
    price: 65000,
    image: heroCrafts,
    rating: 4.9,
    reviews: 41,
    inStock: true,
  },
  {
    id: 6,
    name: "Handwoven Table Mat Set",
    artisan: "Robert Ssempala",
    category: "Textiles",
    price: 45000,
    image: heroCrafts,
    rating: 4.6,
    reviews: 28,
    inStock: false,
  },
];

const formatPrice = (price: number) => {
  return `UGX ${price.toLocaleString()}`;
};

const Marketplace = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-sunset pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-kente opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream mb-6">
              Craft <span className="text-secondary">Marketplace</span>
            </h1>
            <p className="text-warm-cream/80 text-lg mb-8">
              Browse authentic handcrafted products directly from Ugandan artisans. 
              Every purchase supports local communities and preserves cultural heritage.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
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

      {/* Products Grid */}
      <section className="section-padding bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                All Products
              </h2>
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{products.length}</span> products
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
                <option>Sort by: Featured</option>
                <option>Sort by: Price Low to High</option>
                <option>Sort by: Price High to Low</option>
                <option>Sort by: Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 border border-border">
                  {/* Image */}
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-all">
                      <Heart className="h-5 w-5" />
                    </button>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-mudcloth-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-card rounded-lg font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
                      {product.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link to={`/marketplace/${product.id}`}>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">
                      by {product.artisan}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Star className="h-4 w-4 fill-secondary text-secondary" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({product.reviews} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <span className="font-display text-xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <Button 
                        variant="default" 
                        size="sm" 
                        disabled={!product.inStock}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
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
              Load More Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Marketplace;
