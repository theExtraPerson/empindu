import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Edit, Trash2, Info, RotateCcw, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get all images or fallback to default
  const allImages = product.images?.length 
    ? product.images.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url)
    : [heroCrafts];

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`
    });
    setShowDetails(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
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
        transition={{ delay: index * 0.05 }}
        className="group"
      >
        <div className="bg-background overflow-hidden border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
          {/* Image */}
          <div className="aspect-square overflow-hidden relative">
            <img
              src={primaryImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isMobile ? '' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'
              }`}
            />
            
            {!isOwner && (
              <button className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 border-2 border-foreground bg-background flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-all">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {isOwner && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2">
                <button 
                  onClick={() => onEdit?.(product)}
                  className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-foreground bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-all"
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  onClick={() => onDelete?.(product)}
                  className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-foreground bg-background flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-all"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}

            {!product.is_available && (
              <div className="absolute inset-0 bg-foreground/80 flex items-center justify-center">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-background border-2 border-foreground font-display text-xs sm:text-sm tracking-wider">
                  UNAVAILABLE
                </span>
              </div>
            )}

            {product.stock_quantity === 0 && product.is_available && (
              <div className="absolute inset-0 bg-foreground/80 flex items-center justify-center">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-background border-2 border-foreground font-display text-xs sm:text-sm tracking-wider">
                  OUT OF STOCK
                </span>
              </div>
            )}

            <span className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-primary border-2 border-foreground text-primary-foreground font-display text-[10px] sm:text-xs tracking-wider">
              {product.category.toUpperCase()}
            </span>

            {/* Feature badges */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-1">
              {product.is_returnable && (
                <span className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-foreground bg-accent flex items-center justify-center" title="Returnable">
                  <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent-foreground" />
                </span>
              )}
              {product.is_personalizable && (
                <span className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-foreground bg-secondary flex items-center justify-center" title="Personalizable">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-secondary-foreground" />
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 sm:p-4 border-t-2 border-foreground">
            <Link to={`/marketplace/${product.id}`}>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 tracking-wide uppercase">
                {product.name}
              </h3>
            </Link>
            
            {product.artisan && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1 font-body line-clamp-1">
                by {product.artisan.full_name || 'Unknown Artisan'}
              </p>
            )}

            {product.description && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 font-body hidden sm:block">
                {product.description}
              </p>
            )}

            {isOwner && (
              <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground font-body">
                <span className={product.stock_quantity > 0 ? 'text-accent' : 'text-destructive'}>
                  {product.stock_quantity} in stock
                </span>
                <span>•</span>
                <span className={product.is_available ? 'text-accent' : 'text-muted-foreground'}>
                  {product.is_available ? 'Available' : 'Hidden'}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-2.5 sm:mt-4 pt-2.5 sm:pt-4 border-t-2 border-foreground">
              <span className="font-display text-base sm:text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {!isOwner && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetails(true)}
                    className="flex-1 sm:flex-none border-2 border-foreground h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    disabled={product.stock_quantity === 0 || !product.is_available}
                    onClick={() => setShowDetails(true)}
                    className="flex-1 sm:flex-none border-2 border-foreground h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                    <span className="sm:hidden">+</span>
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
            {/* Image Gallery */}
            <div className="space-y-2">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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
