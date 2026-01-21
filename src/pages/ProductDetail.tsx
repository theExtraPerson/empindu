import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Heart, 
  Share2, 
  User, 
  MapPin, 
  Ruler, 
  Palette,
  Sparkles,
  RotateCcw,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import heroCrafts from '@/assets/hero-crafts.jpg';

const formatPrice = (price: number) => {
  return `UGX ${price.toLocaleString()}`;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProductById } = useProducts();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [personalizationNote, setPersonalizationNote] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      const productData = await fetchProductById(id);
      setProduct(productData);
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 border-2 border-dashed border-foreground/30 m-8">
          <Package className="h-20 w-20 text-muted-foreground" />
          <h1 className="font-display text-3xl font-bold tracking-wider">PRODUCT NOT FOUND</h1>
          <Button 
            onClick={() => navigate('/marketplace')}
            className="border-2 border-foreground font-display text-xs tracking-widest"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO MARKETPLACE
          </Button>
        </div>
      </Layout>
    );
  }

  const images = product.images?.length 
    ? product.images.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
    : [{ id: 'default', image_url: heroCrafts, is_primary: true, display_order: 0, product_id: product.id }];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added to your cart`
    });
  };

  const handlePersonalizationSubmit = () => {
    addItem(product, quantity);
    toast({
      title: "Added to cart with personalization",
      description: "Your personalization request will be sent to the artisan after checkout"
    });
    setShowPersonalizationModal(false);
    setPersonalizationNote('');
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="bg-muted py-4 border-b-2 border-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-display text-xs tracking-wider">
            <Link to="/marketplace" className="hover:text-primary transition-colors">
              MARKETPLACE
            </Link>
            <span>/</span>
            <Link to={`/marketplace?category=${product.category}`} className="hover:text-primary transition-colors">
              {product.category.toUpperCase()}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name.toUpperCase()}</span>
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-8 font-display text-xs tracking-widest"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square overflow-hidden bg-muted border-2 border-foreground">
                <img
                  src={images[activeImageIndex].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="w-12 h-12 border-2 border-foreground bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-20 h-20 overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        index === activeImageIndex ? 'border-primary' : 'border-foreground'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-3 py-1 border-2 border-foreground font-display text-xs tracking-widest mb-4">
                  {product.category.toUpperCase()}
                </span>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 uppercase">
                  {product.name}
                </h1>
                
                {product.artisan && (
                  <Link 
                    to={`/artisans/${product.artisan_id}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
                  >
                    <User className="h-4 w-4" />
                    <span>Made by <strong>{product.artisan.full_name || 'Unknown Artisan'}</strong></span>
                    {product.artisan.location && (
                      <>
                        <MapPin className="h-4 w-4 ml-2" />
                        <span>{product.artisan.location}</span>
                      </>
                    )}
                  </Link>
                )}
              </div>

              <div className="font-display text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed font-body text-lg">
                  {product.description}
                </p>
              )}

              <div className="w-full h-0.5 bg-foreground" />

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {product.materials && (
                  <div className="flex items-start gap-3 p-4 bg-muted border-2 border-foreground">
                    <Palette className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-display text-xs tracking-widest mb-1">MATERIALS</p>
                      <p className="text-sm text-muted-foreground font-body">{product.materials}</p>
                    </div>
                  </div>
                )}

                {product.size_category && (
                  <div className="flex items-start gap-3 p-4 bg-muted border-2 border-foreground">
                    <Ruler className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-display text-xs tracking-widest mb-1">SIZE</p>
                      <p className="text-sm text-muted-foreground font-body capitalize">
                        {product.size_category}
                        {product.size_dimensions && ` (${product.size_dimensions})`}
                      </p>
                    </div>
                  </div>
                )}

                {product.use_case && (
                  <div className="flex items-start gap-3 p-4 bg-muted border-2 border-foreground col-span-2">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-display text-xs tracking-widest mb-1">USE CASE</p>
                      <p className="text-sm text-muted-foreground font-body">{product.use_case}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3">
                {product.is_personalizable && (
                  <span className="inline-flex items-center gap-1 px-3 py-2 border-2 border-secondary text-secondary font-display text-xs tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    CAN BE PERSONALISED
                  </span>
                )}
                {product.is_returnable && (
                  <span className="inline-flex items-center gap-1 px-3 py-2 border-2 border-accent text-accent font-display text-xs tracking-wider">
                    <RotateCcw className="h-3 w-3" />
                    RETURNABLE
                  </span>
                )}
                {product.stock_quantity > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-2 border-2 border-primary text-primary font-display text-xs tracking-wider">
                    {product.stock_quantity} IN STOCK
                  </span>
                )}
              </div>

              <div className="w-full h-0.5 bg-foreground" />

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="font-display text-xs tracking-widest">QUANTITY:</Label>
                  <div className="flex items-center border-2 border-foreground">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-3 hover:bg-muted transition-colors font-display"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-6 py-3 min-w-[4rem] text-center font-display font-bold border-x-2 border-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      className="px-4 py-3 hover:bg-muted transition-colors font-display"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-14 font-display text-sm tracking-widest border-2 border-foreground"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || !product.is_available}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    ADD TO CART — {formatPrice(product.price * quantity)}
                  </Button>
                </div>

                {product.is_personalizable && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-14 font-display text-sm tracking-widest border-2 border-foreground"
                    onClick={() => setShowPersonalizationModal(true)}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    REQUEST PERSONALISATION
                  </Button>
                )}
              </div>

              {/* Other Skills */}
              {product.other_skills && (
                <>
                  <div className="w-full h-0.5 bg-foreground" />
                  <div>
                    <h3 className="font-display text-sm tracking-widest mb-2">OTHER SKILLS BY THIS ARTISAN</h3>
                    <p className="text-muted-foreground text-sm font-body">{product.other_skills}</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personalization Modal */}
      <Dialog open={showPersonalizationModal} onOpenChange={setShowPersonalizationModal}>
        <DialogContent className="border-2 border-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">REQUEST PERSONALISATION</DialogTitle>
            <DialogDescription className="font-body">
              Describe how you'd like this product customised. The artisan will review your request after you place your order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="personalization" className="font-display text-xs tracking-widest">YOUR REQUEST</Label>
              <Textarea
                id="personalization"
                value={personalizationNote}
                onChange={(e) => setPersonalizationNote(e.target.value)}
                placeholder="e.g., I'd like initials 'JM' woven into the design, preferred colors: blue and gold..."
                rows={4}
                className="border-2 border-foreground font-body resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handlePersonalizationSubmit}
                disabled={!personalizationNote.trim()}
                className="flex-1 font-display text-xs tracking-widest border-2 border-foreground"
              >
                ADD TO CART WITH PERSONALISATION
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPersonalizationModal(false)}
                className="border-2 border-foreground font-display text-xs tracking-widest"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
