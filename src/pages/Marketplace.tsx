import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Loader2, Package, ArrowRight } from 'lucide-react';
import { useProducts, PRODUCT_CATEGORIES } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

const Marketplace = () => {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.artisan?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory && product.is_available;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary pt-32 pb-20 overflow-hidden border-b-2 border-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 pattern-grid" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-2 border-2 border-primary-foreground/30 text-primary-foreground font-display text-xs tracking-widest mb-6"
            >
              AUTHENTIC HANDCRAFTED GOODS
            </motion.span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-primary-foreground tracking-tight leading-[0.9] mb-6">
              CRAFT
              <br />
              <span className="text-secondary">MARKETPLACE</span>
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-body">
              Browse authentic handcrafted products directly from Ugandan artisans. 
              Every purchase supports local communities and preserves cultural heritage.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/50" />
                <Input
                  placeholder="Search products, artisans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 font-body text-lg focus:border-primary-foreground"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] h-14 bg-primary-foreground/10 border-2 border-primary-foreground/30 text-primary-foreground font-display text-sm tracking-wider">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="CATEGORY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL CATEGORIES</SelectItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>

        {/* Decorative corners */}
        <div className="absolute bottom-0 right-0 w-32 h-32 border-l-4 border-t-4 border-secondary hidden lg:block" />
        <div className="absolute top-32 left-10 w-16 h-16 border-2 border-primary-foreground/20 hidden lg:block" />
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b-2 border-foreground">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-wider mb-1">
                {selectedCategory === 'all' ? 'ALL PRODUCTS' : selectedCategory.toUpperCase()}
              </h2>
              <p className="text-muted-foreground font-body">
                {loading ? (
                  'Loading products...'
                ) : (
                  <>Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-xs tracking-wider text-muted-foreground">SORT BY:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background border-2 border-foreground px-4 py-2 font-display text-xs tracking-wider">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">NEWEST FIRST</SelectItem>
                  <SelectItem value="price-low">PRICE: LOW TO HIGH</SelectItem>
                  <SelectItem value="price-high">PRICE: HIGH TO LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 border-2 border-dashed border-foreground/30"
            >
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2 tracking-wider">
                NO PRODUCTS FOUND
              </h3>
              <p className="text-muted-foreground font-body mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new handcrafted products'
                }
              </p>
              <Button variant="outline" className="border-2 border-foreground" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                CLEAR FILTERS
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Marketplace;
