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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingBag, Truck, CreditCard, CheckCircle, Loader2, MapPin, Building2, Smartphone, Banknote } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { usePickupLocations } from '@/hooks/usePickupLocations';
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
  const { locations, loading: locationsLoading } = usePickupLocations();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile-money');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    notes: ''
  });

  const shippingCost = deliveryMethod === 'pickup' ? 0 : 15000;
  const totalWithShipping = getTotalPrice() + shippingCost;

  const selectedLocation = locations.find(l => l.id === selectedPickupLocation);

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
    
    if (!shippingInfo.fullName || !shippingInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and phone number",
        variant: "destructive"
      });
      return;
    }

    if (deliveryMethod === 'delivery' && (!shippingInfo.address || !shippingInfo.city)) {
      toast({
        title: "Missing Information",
        description: "Please fill in your delivery address",
        variant: "destructive"
      });
      return;
    }

    if (deliveryMethod === 'pickup' && !selectedPickupLocation) {
      toast({
        title: "Missing Information",
        description: "Please select a pickup location",
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
      const orderData = {
        buyer_id: user.id,
        total_amount: totalWithShipping,
        shipping_address: deliveryMethod === 'pickup' 
          ? selectedLocation?.address || 'Pickup Location' 
          : shippingInfo.address,
        shipping_city: deliveryMethod === 'pickup'
          ? selectedLocation?.city || 'Pickup'
          : shippingInfo.city,
        shipping_country: 'Uganda',
        shipping_postal_code: null,
        payment_method: paymentMethod === 'mobile-money' ? momoProvider : 'cash',
        delivery_method: deliveryMethod,
        pickup_location_id: deliveryMethod === 'pickup' ? selectedPickupLocation : null,
        notes: shippingInfo.notes || null,
        status: 'pending' as const
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items and personalization requests
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      // Create personalization requests for items with notes
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.personalizationNote && insertedItems[i]) {
          await supabase
            .from('personalization_requests')
            .insert({
              order_item_id: insertedItems[i].id,
              description: item.personalizationNote,
              status: 'pending'
            });
        }
      }

      // Process payment based on method
      if (paymentMethod === 'mobile-money') {
        setStep('processing');
        setPaymentStatus('Sending payment request to your phone...');
        
        const { data: paymentResponse, error: paymentError } = await supabase.functions.invoke('process-momo-payment', {
          body: {
            orderId: order.id,
            amount: totalWithShipping,
            phoneNumber: shippingInfo.phone,
            provider: momoProvider,
            customerName: shippingInfo.fullName
          }
        });

        if (paymentError) throw paymentError;
        
        if (paymentResponse?.success) {
          setTransactionRef(paymentResponse.transactionRef);
          setPaymentStatus(paymentResponse.message);
          
          // Wait for simulated payment completion
          setTimeout(() => {
            handlePaymentSuccess(order.id);
          }, 6000);
        } else {
          throw new Error(paymentResponse?.error || 'Payment failed');
        }
      } else {
        // Cash on delivery/pickup
        const { data: cashResponse, error: cashError } = await supabase.functions.invoke('process-cash-payment', {
          body: {
            orderId: order.id,
            amount: totalWithShipping,
            customerName: shippingInfo.fullName,
            customerPhone: shippingInfo.phone,
            deliveryMethod: deliveryMethod,
            pickupLocationId: selectedPickupLocation || undefined
          }
        });

        if (cashError) throw cashError;

        if (cashResponse?.success) {
          setTransactionRef(cashResponse.transactionRef);
          handlePaymentSuccess(order.id);
        } else {
          throw new Error(cashResponse?.error || 'Payment processing failed');
        }
      }

    } catch (error: unknown) {
      console.error('Order error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    // Send confirmation email
    if (shippingInfo.email) {
      const shippingAddressText = deliveryMethod === 'pickup'
        ? `Pickup at: ${selectedLocation?.name}<br>${selectedLocation?.address}<br>${selectedLocation?.city}`
        : `${shippingInfo.fullName}<br>${shippingInfo.address}<br>${shippingInfo.city}, Uganda<br>${shippingInfo.phone}`;

      await supabase.functions.invoke('send-order-email', {
        body: {
          type: 'confirmation',
          email: shippingInfo.email,
          customerName: shippingInfo.fullName,
          orderId: orderId,
          orderTotal: totalWithShipping,
          items: items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price * item.quantity
          })),
          shippingAddress: shippingAddressText
        }
      });
    }

    toast({
      title: "Order Placed!",
      description: paymentMethod === 'mobile-money' 
        ? "Payment received! Your order has been confirmed."
        : deliveryMethod === 'pickup' 
          ? "Your order has been placed. We'll notify you when it's ready for pickup."
          : "Your order has been placed. Please have cash ready for the delivery."
    });
    
    clearCart();
    setStep('success');
  };

  // Processing state (for mobile money)
  if (step === 'processing') {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Processing Payment</h2>
            <p className="text-muted-foreground mb-4">{paymentStatus}</p>
            {transactionRef && (
              <p className="text-sm text-muted-foreground mb-6">
                Reference: <span className="font-mono font-medium">{transactionRef}</span>
              </p>
            )}
            <div className="bg-muted/50 rounded-xl p-4 text-left">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {momoProvider === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Check your phone for a payment prompt. Enter your PIN to complete the payment.
              </p>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

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
            {transactionRef && (
              <p className="text-sm text-muted-foreground mb-2">
                Transaction: <span className="font-mono font-medium">{transactionRef}</span>
              </p>
            )}
            <p className="text-muted-foreground mb-8">
              Thank you for supporting Ugandan artisans. You'll receive a confirmation 
              message shortly with your order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/marketplace')}>
                Continue Shopping
              </Button>
              <Button onClick={() => navigate('/profile')}>
                View My Orders
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
              {step === 'shipping' ? 'Delivery Details' : 'Payment'}
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
                  className="space-y-6"
                >
                  {/* Delivery Method Selection */}
                  <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-display text-xl font-bold">Delivery Method</h2>
                    </div>

                    <RadioGroup 
                      value={deliveryMethod} 
                      onValueChange={(value) => setDeliveryMethod(value as 'delivery' | 'pickup')} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${deliveryMethod === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            <span className="font-medium">Home Delivery</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Delivered to your address ({formatPrice(15000)})
                          </p>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            <span className="font-medium">Pickup Point</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Collect from a location (Free)
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                    <h3 className="font-display text-lg font-bold mb-4">Contact Information</h3>
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
                    </div>
                  </div>

                  {/* Delivery Address or Pickup Location */}
                  {deliveryMethod === 'delivery' ? (
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-lg font-bold">Delivery Address</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Street Address *</Label>
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
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-lg font-bold">Select Pickup Location</h3>
                      </div>
                      
                      {locationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : locations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No pickup locations available at the moment.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <Select value={selectedPickupLocation} onValueChange={setSelectedPickupLocation}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a pickup location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} - {location.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedLocation && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-muted/50 rounded-xl p-4"
                            >
                              <h4 className="font-medium mb-2">{selectedLocation.name}</h4>
                              <p className="text-sm text-muted-foreground mb-1">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                {selectedLocation.address}, {selectedLocation.city}
                                {selectedLocation.region && `, ${selectedLocation.region}`}
                              </p>
                              {selectedLocation.operating_hours && (
                                <p className="text-sm text-muted-foreground">
                                  Hours: {selectedLocation.operating_hours}
                                </p>
                              )}
                              {selectedLocation.phone && (
                                <p className="text-sm text-muted-foreground">
                                  Phone: {selectedLocation.phone}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special instructions..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Continue to Payment
                  </Button>
                </motion.form>
              )}

              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
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
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span className="font-medium">Mobile Money</span>
                          </div>
                          <p className="text-sm text-muted-foreground">MTN MoMo, Airtel Money</p>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <span className="font-medium">Cash on {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Mobile Money Provider Selection */}
                  {paymentMethod === 'mobile-money' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-card rounded-2xl p-6 md:p-8 border border-border"
                    >
                      <h3 className="font-display text-lg font-bold mb-4">Select Mobile Money Provider</h3>
                      <RadioGroup 
                        value={momoProvider} 
                        onValueChange={(value) => setMomoProvider(value as 'mtn' | 'airtel')} 
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors cursor-pointer ${momoProvider === 'mtn' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'border-border'}`}>
                          <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                          <Label htmlFor="mtn" className="cursor-pointer text-center">
                            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-2">
                              <span className="font-bold text-black text-xs">MTN</span>
                            </div>
                            <span className="font-medium">MTN MoMo</span>
                          </Label>
                        </div>
                        <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors cursor-pointer ${momoProvider === 'airtel' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'}`}>
                          <RadioGroupItem value="airtel" id="airtel" className="sr-only" />
                          <Label htmlFor="airtel" className="cursor-pointer text-center">
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-2">
                              <span className="font-bold text-white text-xs">Airtel</span>
                            </div>
                            <span className="font-medium">Airtel Money</span>
                          </Label>
                        </div>
                      </RadioGroup>
                      <p className="text-sm text-muted-foreground mt-4">
                        A payment request will be sent to: <strong>{shippingInfo.phone}</strong>
                      </p>
                    </motion.div>
                  )}

                  {/* Cash Payment Info */}
                  {paymentMethod === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-card rounded-2xl p-6 md:p-8 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <Banknote className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <h3 className="font-medium mb-1">Cash Payment</h3>
                          <p className="text-sm text-muted-foreground">
                            {deliveryMethod === 'pickup' 
                              ? `Please have ${formatPrice(totalWithShipping)} ready when you collect your order at the pickup location.`
                              : `Please have ${formatPrice(totalWithShipping)} ready when the delivery arrives.`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Delivery Summary */}
                  <div className="bg-card rounded-2xl p-6 md:p-8 border border-border">
                    <h4 className="font-medium mb-3">
                      {deliveryMethod === 'pickup' ? 'Pickup Location:' : 'Delivery Address:'}
                    </h4>
                    {deliveryMethod === 'pickup' ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{selectedLocation?.name}</p>
                        <p>{selectedLocation?.address}</p>
                        <p>{selectedLocation?.city}</p>
                        {selectedLocation?.operating_hours && <p>Hours: {selectedLocation?.operating_hours}</p>}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{shippingInfo.fullName}</p>
                        <p>{shippingInfo.address}</p>
                        <p>{shippingInfo.city}, Uganda</p>
                        <p>{shippingInfo.phone}</p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'mobile-money' ? (
                      <>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Pay {formatPrice(totalWithShipping)} with {momoProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
                      </>
                    ) : (
                      <>
                        <Banknote className="h-4 w-4 mr-2" />
                        Place Order - {formatPrice(totalWithShipping)} (Pay on {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'})
                      </>
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
                          {item.personalizationNote && (
                            <p className="text-xs text-accent">✨ Personalized</p>
                          )}
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
                    <span className="text-muted-foreground">
                      {deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping'}
                    </span>
                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
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