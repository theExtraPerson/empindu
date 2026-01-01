import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import heroCrafts from '@/assets/hero-crafts.jpg';

interface ProductCardProps {
  product: Product;
  index?: number;
  isOwner?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return `UGX ${price.toLocaleString()}`;
};

export const ProductCard = ({ 
  product, 
  index = 0, 
  isOwner = false,
  onEdit,
  onDelete 
}: ProductCardProps) => {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`
    });
  };

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url 
    || product.images?.[0]?.image_url 
    || heroCrafts;

  return (
    <motion.div
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
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {!isOwner && (
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-all">
              <Heart className="h-5 w-5" />
            </button>
          )}

          {isOwner && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => onEdit?.(product)}
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card transition-all"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button 
                onClick={() => onDelete?.(product)}
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}

          {!product.is_available && (
            <div className="absolute inset-0 bg-mudcloth-black/60 flex items-center justify-center">
              <span className="px-4 py-2 bg-card rounded-lg font-semibold">
                Unavailable
              </span>
            </div>
          )}

          {product.stock_quantity === 0 && product.is_available && (
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
          
          {product.artisan && (
            <p className="text-muted-foreground text-sm mt-1">
              by {product.artisan.full_name || 'Unknown Artisan'}
            </p>
          )}

          {product.description && (
            <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
              {product.description}
            </p>
          )}

          {isOwner && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className={product.stock_quantity > 0 ? 'text-accent' : 'text-destructive'}>
                {product.stock_quantity} in stock
              </span>
              <span>•</span>
              <span className={product.is_available ? 'text-accent' : 'text-muted-foreground'}>
                {product.is_available ? 'Available' : 'Hidden'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="font-display text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {!isOwner && (
              <Button 
                variant="default" 
                size="sm" 
                disabled={product.stock_quantity === 0 || !product.is_available}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
