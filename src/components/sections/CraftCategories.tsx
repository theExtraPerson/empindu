import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "basketry",
    name: "Basketry",
    description: "Hand-woven baskets with intricate patterns",
    count: 340,
    color: "from-primary to-copper",
  },
  {
    id: "barkcloth",
    name: "Barkcloth",
    description: "Traditional Ugandan textile art",
    count: 156,
    color: "from-bark-brown to-mudcloth-black",
  },
  {
    id: "woodcarving",
    name: "Woodcarving",
    description: "Sculptural art from local hardwoods",
    count: 278,
    color: "from-accent to-accent-soft",
  },
  {
    id: "pottery",
    name: "Pottery",
    description: "Handcrafted clay vessels and decor",
    count: 189,
    color: "from-secondary to-kente-gold",
  },
  {
    id: "jewelry",
    name: "Jewelry",
    description: "Beaded and metalwork adornments",
    count: 412,
    color: "from-copper to-primary",
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Woven fabrics and embroidery",
    count: 223,
    color: "from-primary-deep to-bark-brown",
  },
];

export function CraftCategories() {
  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
            Explore By Category
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Traditional <span className="text-primary">Craft</span> Types
          </h2>
          <p className="text-muted-foreground">
            Discover the diverse world of Ugandan craftsmanship, from centuries-old 
            barkcloth making to intricate basket weaving techniques.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/marketplace?category=${category.id}`}
                className="group block"
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-6 md:p-8 h-full min-h-[200px] transition-all duration-500 hover:-translate-y-2 hover:shadow-strong`}>
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 pattern-kente opacity-20" />
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-warm-cream mb-2">
                        {category.name}
                      </h3>
                      <p className="text-warm-cream/80 text-sm">
                        {category.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-warm-cream/70 text-sm">
                        {category.count} products
                      </span>
                      <span className="w-10 h-10 rounded-full bg-warm-cream/20 backdrop-blur-sm flex items-center justify-center text-warm-cream group-hover:bg-warm-cream group-hover:text-primary transition-all duration-300">
                        <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
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
