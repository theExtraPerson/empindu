import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Edit, Trash2, Info, RotateCcw, Sparkles, X } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const [showDetails, setShowDetails] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`
    });
    setShowDetails(false);
  };

  const primaryImage = product.images?.find(img => img.is_primary)?.image_url 
    || product.images?.[0]?.image_url 
    || heroCrafts;

  return (
    <>
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

            {/* Feature badges */}
            <div className="absolute bottom-4 right-4 flex gap-1">
              {product.is_returnable && (
                <span className="w-7 h-7 rounded-full bg-accent/90 flex items-center justify-center" title="Returnable">
                  <RotateCcw className="h-3.5 w-3.5 text-accent-foreground" />
                </span>
              )}
              {product.is_personalizable && (
                <span className="w-7 h-7 rounded-full bg-secondary/90 flex items-center justify-center" title="Personalizable">
                  <Sparkles className="h-3.5 w-3.5 text-secondary-foreground" />
                </span>
              )}
            </div>
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
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetails(true)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    disabled={product.stock_quantity === 0 || !product.is_available}
                    onClick={() => setShowDetails(true)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Image */}
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={primaryImage} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {product.category}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.artisan && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs mb-1">Made by</p>
                  <p className="font-medium">{product.artisan.full_name || 'Unknown Artisan'}</p>
                </div>
              )}
              
              {product.materials && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs mb-1">Materials</p>
                  <p className="font-medium">{product.materials}</p>
                </div>
              )}

              {product.use_case && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs mb-1">Use Case</p>
                  <p className="font-medium">{product.use_case}</p>
                </div>
              )}

              {product.size_category && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground text-xs mb-1">Size</p>
                  <p className="font-medium">
                    {product.size_category}
                    {product.size_dimensions && ` (${product.size_dimensions})`}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}

            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_returnable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  <RotateCcw className="h-4 w-4" />
                  Returnable
                </span>
              )}
              {product.is_personalizable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Personalizable
                </span>
              )}
              {!product.is_returnable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                  <X className="h-4 w-4" />
                  Non-returnable
                </span>
              )}
            </div>

            {/* Other Skills */}
            {product.other_skills && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Artisan's Other Skills</p>
                <p className="text-sm">{product.other_skills}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                asChild
              >
                <Link to={`/marketplace/${product.id}`}>
                  View Full Details
                </Link>
              </Button>
              <Button 
                className="flex-1"
                disabled={product.stock_quantity === 0 || !product.is_available}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
