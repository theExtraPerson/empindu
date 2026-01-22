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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
        <section className="min-h-screen flex items-center justify-center bg-background pattern-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-card border-2 border-foreground p-12 shadow-brutal"
          >
            <div className="w-20 h-20 border-2 border-foreground flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-foreground" />
            </div>
            <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to checkout</p>
            <Button 
              onClick={() => navigate('/marketplace')}
              className="uppercase tracking-wider border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all"
            >
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
        <section className="min-h-screen flex items-center justify-center bg-background pattern-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-24 h-24 border-4 border-foreground flex items-center justify-center mx-auto mb-8 bg-secondary">
              <Loader2 className="h-12 w-12 text-foreground animate-spin" />
            </div>
            <h2 className="font-display text-3xl uppercase tracking-wider mb-4">Processing Payment</h2>
            <p className="text-muted-foreground mb-4">{paymentStatus}</p>
            {transactionRef && (
              <p className="text-sm text-muted-foreground mb-6">
                Reference: <span className="font-mono font-bold text-foreground">{transactionRef}</span>
              </p>
            )}
            <div className="bg-card border-2 border-foreground p-6 text-left shadow-brutal">
              <h4 className="font-display uppercase tracking-wider mb-2 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
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
        <section className="min-h-screen flex items-center justify-center bg-background pattern-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-24 h-24 border-4 border-foreground flex items-center justify-center mx-auto mb-8 bg-accent">
              <CheckCircle className="h-12 w-12 text-foreground" />
            </div>
            <h2 className="font-display text-4xl uppercase tracking-wider mb-4">Order Confirmed!</h2>
            {transactionRef && (
              <p className="text-sm text-muted-foreground mb-2">
                Transaction: <span className="font-mono font-bold text-foreground">{transactionRef}</span>
              </p>
            )}
            <p className="text-muted-foreground mb-8">
              Thank you for supporting Ugandan artisans. You'll receive a confirmation 
              message shortly with your order details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/marketplace')}
                className="uppercase tracking-wider border-2 border-foreground shadow-brutal hover:shadow-brutal-lg"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => navigate('/profile')}
                className="uppercase tracking-wider border-2 border-foreground shadow-brutal hover:shadow-brutal-lg"
              >
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
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-kente opacity-10" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-foreground" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Button 
              variant="ghost" 
              onClick={() => step === 'shipping' ? navigate(-1) : setStep('shipping')}
              className="mb-6 text-primary-foreground hover:bg-primary-foreground/10 uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 'shipping' ? 'Back' : 'Back to Shipping'}
            </Button>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-wider text-primary-foreground">
              {step === 'shipping' ? 'Delivery Details' : 'Payment'}
            </h1>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mt-8">
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-secondary' : 'text-primary-foreground/60'}`}>
                <div className={`w-8 h-8 border-2 flex items-center justify-center font-bold ${step === 'shipping' ? 'border-secondary bg-secondary text-foreground' : 'border-primary-foreground/60'}`}>
                  1
                </div>
                <span className="font-display uppercase tracking-wider text-sm hidden sm:block">Shipping</span>
              </div>
              <div className="flex-1 h-0.5 bg-primary-foreground/30" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-secondary' : 'text-primary-foreground/60'}`}>
                <div className={`w-8 h-8 border-2 flex items-center justify-center font-bold ${step === 'payment' ? 'border-secondary bg-secondary text-foreground' : 'border-primary-foreground/60'}`}>
                  2
                </div>
                <span className="font-display uppercase tracking-wider text-sm hidden sm:block">Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Form Section */}
            <div className="lg:col-span-2">
              {step === 'shipping' && (
                <motion.form
                  variants={itemVariants}
                  onSubmit={handleShippingSubmit}
                  className="space-y-6"
                >
                  {/* Delivery Method Selection */}
                  <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-foreground pb-4">
                      <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-secondary">
                        <Truck className="h-6 w-6 text-foreground" />
                      </div>
                      <h2 className="font-display text-xl uppercase tracking-wider">Delivery Method</h2>
                    </div>

                    <RadioGroup 
                      value={deliveryMethod} 
                      onValueChange={(value) => setDeliveryMethod(value as 'delivery' | 'pickup')} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className={`flex items-center space-x-3 p-4 border-2 transition-all cursor-pointer ${deliveryMethod === 'delivery' ? 'border-foreground bg-secondary/30 shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            <span className="font-display uppercase tracking-wider">Home Delivery</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Delivered to your address ({formatPrice(15000)})
                          </p>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 border-2 transition-all cursor-pointer ${deliveryMethod === 'pickup' ? 'border-foreground bg-secondary/30 shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            <span className="font-display uppercase tracking-wider">Pickup Point</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Collect from a location (Free)
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                    <h3 className="font-display text-lg uppercase tracking-wider mb-6 border-b-2 border-foreground pb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-display uppercase tracking-wider text-sm">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter your full name"
                          required
                          className="border-2 border-foreground focus:shadow-brutal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-display uppercase tracking-wider text-sm">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+256 700 000 000"
                          required
                          className="border-2 border-foreground focus:shadow-brutal"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="font-display uppercase tracking-wider text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                          className="border-2 border-foreground focus:shadow-brutal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address or Pickup Location */}
                  {deliveryMethod === 'delivery' ? (
                    <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                      <div className="flex items-center gap-3 mb-6 border-b-2 border-foreground pb-4">
                        <MapPin className="h-5 w-5 text-foreground" />
                        <h3 className="font-display text-lg uppercase tracking-wider">Delivery Address</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address" className="font-display uppercase tracking-wider text-sm">Street Address *</Label>
                          <Input
                            id="address"
                            value={shippingInfo.address}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Street address, building, etc."
                            required
                            className="border-2 border-foreground focus:shadow-brutal"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city" className="font-display uppercase tracking-wider text-sm">City/Town *</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g., Kampala"
                            required
                            className="border-2 border-foreground focus:shadow-brutal"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                      <div className="flex items-center gap-3 mb-6 border-b-2 border-foreground pb-4">
                        <Building2 className="h-5 w-5 text-foreground" />
                        <h3 className="font-display text-lg uppercase tracking-wider">Select Pickup Location</h3>
                      </div>
                      
                      {locationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                        </div>
                      ) : locations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No pickup locations available at the moment.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <Select value={selectedPickupLocation} onValueChange={setSelectedPickupLocation}>
                            <SelectTrigger className="border-2 border-foreground">
                              <SelectValue placeholder="Choose a pickup location" />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-foreground">
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
                              className="bg-muted/50 border-2 border-foreground p-4"
                            >
                              <h4 className="font-display uppercase tracking-wider mb-2">{selectedLocation.name}</h4>
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
                  <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="font-display uppercase tracking-wider text-sm">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special instructions..."
                        rows={3}
                        className="border-2 border-foreground focus:shadow-brutal"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full uppercase tracking-wider border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all text-lg py-6"
                  >
                    Continue to Payment
                  </Button>
                </motion.form>
              )}

              {step === 'payment' && (
                <motion.div
                  variants={itemVariants}
                  className="space-y-6"
                >
                  <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-foreground pb-4">
                      <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-secondary">
                        <CreditCard className="h-6 w-6 text-foreground" />
                      </div>
                      <h2 className="font-display text-xl uppercase tracking-wider">Payment Method</h2>
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className={`flex items-center space-x-3 p-4 border-2 transition-all cursor-pointer ${paymentMethod === 'mobile-money' ? 'border-foreground bg-secondary/30 shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                        <RadioGroupItem value="mobile-money" id="mobile-money" />
                        <Label htmlFor="mobile-money" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span className="font-display uppercase tracking-wider">Mobile Money</span>
                          </div>
                          <p className="text-sm text-muted-foreground">MTN MoMo, Airtel Money</p>
                        </Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 border-2 transition-all cursor-pointer ${paymentMethod === 'cash' ? 'border-foreground bg-secondary/30 shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <span className="font-display uppercase tracking-wider">Cash on {deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</span>
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
                      className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal"
                    >
                      <h3 className="font-display text-lg uppercase tracking-wider mb-6 border-b-2 border-foreground pb-4">Select Provider</h3>
                      <RadioGroup 
                        value={momoProvider} 
                        onValueChange={(value) => setMomoProvider(value as 'mtn' | 'airtel')} 
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className={`flex flex-col items-center justify-center p-6 border-2 transition-all cursor-pointer ${momoProvider === 'mtn' ? 'border-foreground bg-secondary shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                          <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
                          <Label htmlFor="mtn" className="cursor-pointer text-center">
                            <div className="w-14 h-14 border-2 border-foreground bg-yellow-400 flex items-center justify-center mx-auto mb-3">
                              <span className="font-display font-bold text-foreground text-sm">MTN</span>
                            </div>
                            <span className="font-display uppercase tracking-wider">MTN MoMo</span>
                          </Label>
                        </div>
                        <div className={`flex flex-col items-center justify-center p-6 border-2 transition-all cursor-pointer ${momoProvider === 'airtel' ? 'border-foreground bg-secondary shadow-brutal' : 'border-muted-foreground/30 hover:border-foreground'}`}>
                          <RadioGroupItem value="airtel" id="airtel" className="sr-only" />
                          <Label htmlFor="airtel" className="cursor-pointer text-center">
                            <div className="w-14 h-14 border-2 border-foreground bg-red-600 flex items-center justify-center mx-auto mb-3">
                              <span className="font-display font-bold text-white text-sm">Airtel</span>
                            </div>
                            <span className="font-display uppercase tracking-wider">Airtel Money</span>
                          </Label>
                        </div>
                      </RadioGroup>
                      <p className="text-sm text-muted-foreground mt-6 p-3 border-l-4 border-foreground bg-muted/50">
                        A payment request will be sent to: <strong className="text-foreground">{shippingInfo.phone}</strong>
                      </p>
                    </motion.div>
                  )}

                  {/* Cash Payment Info */}
                  {paymentMethod === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-accent flex-shrink-0">
                          <Banknote className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-display uppercase tracking-wider mb-2">Cash Payment</h3>
                          <p className="text-muted-foreground">
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
                  <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-brutal">
                    <h4 className="font-display uppercase tracking-wider mb-4 border-b-2 border-foreground pb-4">
                      {deliveryMethod === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                    </h4>
                    {deliveryMethod === 'pickup' ? (
                      <div className="text-sm space-y-1">
                        <p className="font-display uppercase tracking-wider text-foreground">{selectedLocation?.name}</p>
                        <p className="text-muted-foreground">{selectedLocation?.address}</p>
                        <p className="text-muted-foreground">{selectedLocation?.city}</p>
                        {selectedLocation?.operating_hours && <p className="text-muted-foreground">Hours: {selectedLocation?.operating_hours}</p>}
                      </div>
                    ) : (
                      <div className="text-sm space-y-1">
                        <p className="font-display uppercase tracking-wider text-foreground">{shippingInfo.fullName}</p>
                        <p className="text-muted-foreground">{shippingInfo.address}</p>
                        <p className="text-muted-foreground">{shippingInfo.city}, Uganda</p>
                        <p className="text-muted-foreground">{shippingInfo.phone}</p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full uppercase tracking-wider border-2 border-foreground shadow-brutal hover:shadow-brutal-lg transition-all text-lg py-6"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : paymentMethod === 'mobile-money' ? (
                      <>
                        <Smartphone className="h-5 w-5 mr-2" />
                        Pay {formatPrice(totalWithShipping)} with {momoProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
                      </>
                    ) : (
                      <>
                        <Banknote className="h-5 w-5 mr-2" />
                        Place Order - {formatPrice(totalWithShipping)}
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-card border-2 border-foreground p-6 shadow-brutal sticky top-24">
                <h3 className="font-display text-lg uppercase tracking-wider mb-6 border-b-2 border-foreground pb-4">Order Summary</h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {items.map((item) => {
                    const primaryImage = item.product.images?.find(img => img.is_primary)?.image_url 
                      || item.product.images?.[0]?.image_url 
                      || heroCrafts;

                    return (
                      <div key={item.product.id} className="flex gap-3 pb-3 border-b border-muted">
                        <div className="w-16 h-16 border-2 border-foreground overflow-hidden flex-shrink-0">
                          <img
                            src={primaryImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display uppercase tracking-wider text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          {item.personalizationNote && (
                            <p className="text-xs text-accent">✨ Personalized</p>
                          )}
                          <p className="font-display text-sm text-primary mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4 bg-foreground h-0.5" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-display">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {deliveryMethod === 'pickup' ? 'Pickup' : 'Shipping'}
                    </span>
                    <span className="font-display">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <Separator className="my-4 bg-foreground h-0.5" />

                <div className="flex justify-between items-center">
                  <span className="font-display uppercase tracking-wider text-lg">Total</span>
                  <span className="font-display text-2xl text-primary">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
