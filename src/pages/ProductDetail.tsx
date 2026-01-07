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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
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
    // Store personalization note in cart item (we'll pass it during checkout)
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
      <section className="bg-muted/50 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/marketplace" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <span>/</span>
            <Link to={`/marketplace?category=${product.category}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="section-padding bg-background">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={images[activeImageIndex].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        index === activeImageIndex ? 'border-primary' : 'border-transparent'
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
                <Badge className="mb-3">{product.category}</Badge>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  {product.name}
                </h1>
                
                {product.artisan && (
                  <Link 
                    to={`/artisans/${product.artisan_id}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
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

              <div className="text-3xl font-display font-bold text-primary">
                {formatPrice(product.price)}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              <Separator />

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {product.materials && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Palette className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Materials</p>
                      <p className="text-sm text-muted-foreground">{product.materials}</p>
                    </div>
                  </div>
                )}

                {product.size_category && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Ruler className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Size</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {product.size_category}
                        {product.size_dimensions && ` (${product.size_dimensions})`}
                      </p>
                    </div>
                  </div>
                )}

                {product.use_case && (
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg col-span-2">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Use Case</p>
                      <p className="text-sm text-muted-foreground">{product.use_case}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_personalizable && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Can be Personalised
                  </Badge>
                )}
                {product.is_returnable && (
                  <Badge variant="secondary" className="gap-1">
                    <RotateCcw className="h-3 w-3" />
                    Returnable
                  </Badge>
                )}
                {product.stock_quantity > 0 && (
                  <Badge variant="outline" className="text-accent border-accent">
                    {product.stock_quantity} in stock
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-base">Quantity:</Label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || !product.is_available}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart - {formatPrice(product.price * quantity)}
                  </Button>
                </div>

                {product.is_personalizable && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setShowPersonalizationModal(true)}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Request Personalisation
                  </Button>
                )}
              </div>

              {/* Other Skills */}
              {product.other_skills && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Other Skills by This Artisan</h3>
                    <p className="text-muted-foreground text-sm">{product.other_skills}</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personalization Modal */}
      <Dialog open={showPersonalizationModal} onOpenChange={setShowPersonalizationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Personalisation</DialogTitle>
            <DialogDescription>
              Describe how you'd like this product customised. The artisan will review your request after you place your order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="personalization">Your Personalisation Request</Label>
              <Textarea
                id="personalization"
                value={personalizationNote}
                onChange={(e) => setPersonalizationNote(e.target.value)}
                placeholder="e.g., I'd like initials 'JM' woven into the design, preferred colors: blue and gold..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handlePersonalizationSubmit}
                disabled={!personalizationNote.trim()}
                className="flex-1"
              >
                Add to Cart with Personalisation
              </Button>
              <Button variant="outline" onClick={() => setShowPersonalizationModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
