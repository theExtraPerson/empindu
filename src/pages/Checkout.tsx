import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ShoppingBag, Truck, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import heroCrafts from '@/assets/hero-crafts.jpg';

const formatPrice = (price: number) => {
  return `UGX ${price.toLocaleString()}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile-money');
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    notes: ''
  });

  const shippingCost = 15000; // Fixed shipping for now
  const totalWithShipping = getTotalPrice() + shippingCost;

  if (items.length === 0 && step !== 'success') {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to checkout</p>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </motion.div>
        </section>
      </Layout>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your order",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total_amount: totalWithShipping,
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_country: 'Uganda',
          shipping_postal_code: null,
          payment_method: paymentMethod,
          notes: shippingInfo.notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send confirmation email
      if (shippingInfo.email) {
        await supabase.functions.invoke('send-order-email', {
          body: {
            type: 'confirmation',
            email: shippingInfo.email,
            customerName: shippingInfo.fullName,
            orderId: order.id,
            orderTotal: totalWithShipping,
            items: items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price * item.quantity
            })),
            shippingAddress: `${shippingInfo.fullName}<br>${shippingInfo.address}<br>${shippingInfo.city}, Uganda<br>${shippingInfo.phone}`
          }
        });
      }

      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully. Check your email for confirmation."
      });
      
      clearCart();
      setStep('success');
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for supporting Ugandan artisans. You'll receive a confirmation 
              message shortly with your order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/marketplace')}>
                Continue Shopping
              </Button>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-gradient-sunset pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pattern-kente opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Button 
              variant="ghost-light" 
              onClick={() => step === 'shipping' ? navigate(-1) : setStep('shipping')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 'shipping' ? 'Back' : 'Back to Shipping'}
            </Button>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-warm-cream">
              {step === 'shipping' ? 'Shipping Details' : 'Payment'}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {step === 'shipping' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleShippingSubmit}
                  className="bg-card rounded-2xl p-6 md:p-8 border border-border"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Shipping Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+256 700 000 000"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Street address, building, etc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Kampala"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special delivery instructions..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6">
                    Continue to Payment
                  </Button>
                </motion.form>
              )}

              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl p-6 md:p-8 border border-border"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">Payment Method</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${paymentMethod === 'mobile-money' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="mobile-money" id="mobile-money" />
                      <Label htmlFor="mobile-money" className="flex-1 cursor-pointer">
                        <span className="font-medium">Mobile Money</span>
                        <p className="text-sm text-muted-foreground">MTN MoMo, Airtel Money</p>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator className="my-6" />

                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h4 className="font-medium mb-2">Shipping to:</h4>
                    <p className="text-sm text-muted-foreground">
                      {shippingInfo.fullName}<br />
                      {shippingInfo.address}<br />
                      {shippingInfo.city}<br />
                      {shippingInfo.phone}
                    </p>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Place Order - {formatPrice(totalWithShipping)}</>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl p-6 border border-border sticky top-24"
              >
                <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {items.map((item) => {
                    const primaryImage = item.product.images?.find(img => img.is_primary)?.image_url 
                      || item.product.images?.[0]?.image_url 
                      || heroCrafts;

                    return (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={primaryImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-medium text-sm text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-xl text-primary">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
