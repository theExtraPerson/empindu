import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gift, Users, Package, Truck, MessageSquare, Building2, 
  Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Heart
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCorporateGifting, GiftRecipient, GiftItem } from '@/hooks/useCorporateGifting';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const OCCASIONS = ['Employee Appreciation', 'Client Thank You', 'Holiday Season', 'Corporate Event', 'Conference Gifts', 'Team Building', 'Retirement', 'Other'];
const BUDGET_RANGES = ['500,000 - 1,000,000 UGX', '1,000,000 - 3,000,000 UGX', '3,000,000 - 5,000,000 UGX', '5,000,000 - 10,000,000 UGX', '10,000,000+ UGX'];

const CorporateGifting = () => {
  const { products } = useProducts();
  const { submitGiftOrder, submitting } = useCorporateGifting();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Company details
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Step 2: Products
  const [selectedItems, setSelectedItems] = useState<GiftItem[]>([]);

  // Step 3: Customization
  const [giftMessage, setGiftMessage] = useState('');
  const [brandingNotes, setBrandingNotes] = useState('');

  // Step 4: Recipients
  const [recipients, setRecipients] = useState<GiftRecipient[]>([{ name: '' }]);

  const availableProducts = products.filter(p => p.is_available && p.stock_quantity > 0);

  const addProduct = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product || selectedItems.find(i => i.product_id === productId)) return;
    setSelectedItems([...selectedItems, {
      product_id: product.id,
      product_name: product.name,
      quantity: recipients.length || 1,
      unit_price: product.price,
      image_url: product.images?.[0]?.image_url,
    }]);
  };

  const removeProduct = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.product_id !== productId));
  };

  const updateItemQty = (productId: string, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.product_id === productId ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const updateItemPersonalization = (productId: string, text: string) => {
    setSelectedItems(selectedItems.map(i => i.product_id === productId ? { ...i, personalization: text } : i));
  };

  const addRecipient = () => setRecipients([...recipients, { name: '' }]);
  const removeRecipient = (idx: number) => setRecipients(recipients.filter((_, i) => i !== idx));
  const updateRecipient = (idx: number, field: keyof GiftRecipient, value: string) => {
    setRecipients(recipients.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const totalCost = selectedItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const handleSubmit = async () => {
    const ok = await submitGiftOrder({
      company_name: companyName,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      occasion,
      budget_range: budgetRange,
      delivery_date: deliveryDate || undefined,
      gift_message: giftMessage,
      branding_notes: brandingNotes,
      recipient_count: recipients.filter(r => r.name).length,
      items: selectedItems,
      recipients: recipients.filter(r => r.name),
    });
    if (ok) setSubmitted(true);
  };

  if (!user) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center border-2 border-foreground p-12 shadow-brutal bg-card max-w-md">
            <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="font-display text-2xl mb-2">SIGN IN REQUIRED</h2>
            <p className="font-body text-muted-foreground mb-6">Please sign in to access corporate gifting</p>
            <Button onClick={() => navigate('/auth')} className="font-display text-xs tracking-widest border-2 border-foreground">
              SIGN IN
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center bg-background pt-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center border-2 border-foreground p-12 shadow-brutal bg-card max-w-lg">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="font-display text-3xl mb-3">ORDER SUBMITTED!</h2>
            <p className="font-body text-muted-foreground mb-6">
              Our team will review your corporate gift order and contact you within 24 hours to confirm details, pricing, and delivery logistics.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/marketplace')} variant="outline" className="font-display text-xs tracking-widest border-2 border-foreground">
                BROWSE MORE
              </Button>
              <Button onClick={() => navigate('/')} className="font-display text-xs tracking-widest border-2 border-foreground">
                GO HOME
              </Button>
            </div>
          </motion.div>
        </section>
      </Layout>
    );
  }

  const steps = [
    { num: 1, label: 'COMPANY', icon: Building2 },
    { num: 2, label: 'PRODUCTS', icon: Package },
    { num: 3, label: 'CUSTOMIZE', icon: Sparkles },
    { num: 4, label: 'RECIPIENTS', icon: Users },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-foreground pt-32 pb-16 border-b-2 border-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-5"><div className="absolute inset-0 pattern-kente" /></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-2 border-2 border-background/30 text-background font-display text-xs tracking-widest mb-6">
            <Gift className="h-4 w-4" /> CORPORATE GIFTING
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-6xl font-bold text-background tracking-tight leading-[0.9] mb-4">
            GIFT WITH
            <br />
            <span className="text-secondary">PURPOSE</span>
          </motion.h1>
          <p className="text-background/70 font-body text-lg max-w-xl mx-auto">
            Handcrafted Ugandan products that tell a story. Perfect for employee appreciation, client gifts, and corporate events.
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="py-6 border-b-2 border-foreground bg-muted sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => s.num < step && setStep(s.num)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 font-display text-xs tracking-widest transition-all border-2 ${
                    step === s.num ? 'bg-primary text-primary-foreground border-primary' :
                    step > s.num ? 'bg-accent text-accent-foreground border-accent' :
                    'bg-background text-muted-foreground border-foreground/30'
                  }`}
                >
                  <s.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{s.label}</span>
                  <span className="md:hidden">{s.num}</span>
                </button>
                {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Steps */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Step 1: Company Details */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border-2 border-foreground p-6 bg-card shadow-brutal">
                <h2 className="font-display text-xl tracking-wider mb-6 pb-4 border-b-2 border-foreground">COMPANY DETAILS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="font-display text-xs tracking-widest">COMPANY NAME *</Label><Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="border-2 border-foreground mt-1" placeholder="Acme Corp" /></div>
                  <div><Label className="font-display text-xs tracking-widest">CONTACT PERSON *</Label><Input value={contactName} onChange={e => setContactName(e.target.value)} className="border-2 border-foreground mt-1" placeholder="John Doe" /></div>
                  <div><Label className="font-display text-xs tracking-widest">EMAIL *</Label><Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="border-2 border-foreground mt-1" placeholder="john@acme.com" /></div>
                  <div><Label className="font-display text-xs tracking-widest">PHONE</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="border-2 border-foreground mt-1" placeholder="+256 700 000 000" /></div>
                  <div>
                    <Label className="font-display text-xs tracking-widest">OCCASION</Label>
                    <Select value={occasion} onValueChange={setOccasion}>
                      <SelectTrigger className="border-2 border-foreground mt-1"><SelectValue placeholder="Select occasion" /></SelectTrigger>
                      <SelectContent>{OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-display text-xs tracking-widest">BUDGET RANGE</Label>
                    <Select value={budgetRange} onValueChange={setBudgetRange}>
                      <SelectTrigger className="border-2 border-foreground mt-1"><SelectValue placeholder="Select budget" /></SelectTrigger>
                      <SelectContent>{BUDGET_RANGES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2"><Label className="font-display text-xs tracking-widest">PREFERRED DELIVERY DATE</Label><Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="border-2 border-foreground mt-1" /></div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!companyName || !contactName || !contactEmail} className="font-display text-xs tracking-widest border-2 border-foreground">
                  NEXT: SELECT PRODUCTS <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Product Selection */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border-2 border-foreground p-6 bg-card shadow-brutal">
                <h2 className="font-display text-xl tracking-wider mb-6 pb-4 border-b-2 border-foreground">SELECT GIFT PRODUCTS</h2>
                
                {/* Add product */}
                <Select onValueChange={addProduct}>
                  <SelectTrigger className="border-2 border-foreground mb-4">
                    <SelectValue placeholder="+ Add a product to your gift set" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.filter(p => !selectedItems.find(i => i.product_id === p.id)).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — UGX {p.price.toLocaleString()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected items */}
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-foreground/30">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="font-display text-sm text-muted-foreground">NO PRODUCTS SELECTED YET</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map(item => (
                      <div key={item.product_id} className="border-2 border-foreground p-4 flex items-start gap-4">
                        {item.image_url && <img src={item.image_url} alt="" className="w-16 h-16 object-cover border border-foreground" />}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-display text-sm tracking-wider">{item.product_name.toUpperCase()}</h4>
                            <button onClick={() => removeProduct(item.product_id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="font-display text-[10px] tracking-widest">QTY:</Label>
                            <Input type="number" min={1} value={item.quantity} onChange={e => updateItemQty(item.product_id, parseInt(e.target.value) || 1)} className="w-20 h-8 border-2 border-foreground text-center font-display text-sm" />
                            <span className="font-display text-sm text-primary">UGX {(item.unit_price * item.quantity).toLocaleString()}</span>
                          </div>
                          <Input placeholder="Personalization (optional, e.g. company logo placement)" value={item.personalization || ''} onChange={e => updateItemPersonalization(item.product_id, e.target.value)} className="border border-foreground/30 text-sm h-8" />
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-muted border-2 border-foreground flex justify-between items-center">
                      <span className="font-display text-sm tracking-wider">ESTIMATED TOTAL</span>
                      <span className="font-display text-xl font-bold text-primary">UGX {totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="font-display text-xs tracking-widest border-2 border-foreground"><ArrowLeft className="h-4 w-4 mr-2" /> BACK</Button>
                <Button onClick={() => setStep(3)} disabled={selectedItems.length === 0} className="font-display text-xs tracking-widest border-2 border-foreground">NEXT: CUSTOMIZE <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customization */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border-2 border-foreground p-6 bg-card shadow-brutal">
                <h2 className="font-display text-xl tracking-wider mb-6 pb-4 border-b-2 border-foreground">CUSTOMIZE YOUR GIFTS</h2>
                <div className="space-y-5">
                  <div>
                    <Label className="font-display text-xs tracking-widest flex items-center gap-2"><Heart className="h-3 w-3" /> GIFT MESSAGE</Label>
                    <Textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="A heartfelt message to include with each gift..." rows={3} className="border-2 border-foreground mt-1 resize-none" />
                  </div>
                  <div>
                    <Label className="font-display text-xs tracking-widest flex items-center gap-2"><Sparkles className="h-3 w-3" /> BRANDING & PACKAGING NOTES</Label>
                    <Textarea value={brandingNotes} onChange={e => setBrandingNotes(e.target.value)} placeholder="Include company logo on packaging, specific wrapping style, branded ribbon..." rows={3} className="border-2 border-foreground mt-1 resize-none" />
                    <p className="text-[10px] text-muted-foreground font-body mt-1">Our team will work with you to incorporate your brand identity</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="font-display text-xs tracking-widest border-2 border-foreground"><ArrowLeft className="h-4 w-4 mr-2" /> BACK</Button>
                <Button onClick={() => setStep(4)} className="font-display text-xs tracking-widest border-2 border-foreground">NEXT: RECIPIENTS <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Recipients */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border-2 border-foreground p-6 bg-card shadow-brutal">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-foreground">
                  <h2 className="font-display text-xl tracking-wider">GIFT RECIPIENTS</h2>
                  <Button variant="outline" size="sm" onClick={addRecipient} className="font-display text-[10px] tracking-widest border-2 border-foreground">
                    <Plus className="h-3 w-3 mr-1" /> ADD
                  </Button>
                </div>
                <div className="space-y-4">
                  {recipients.map((r, idx) => (
                    <div key={idx} className="border-2 border-foreground/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs tracking-widest">RECIPIENT {idx + 1}</span>
                        {recipients.length > 1 && <button onClick={() => removeRecipient(idx)}><Trash2 className="h-4 w-4 text-destructive" /></button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input placeholder="Full Name *" value={r.name} onChange={e => updateRecipient(idx, 'name', e.target.value)} className="border border-foreground/50 h-9 text-sm" />
                        <Input placeholder="Email" value={r.email || ''} onChange={e => updateRecipient(idx, 'email', e.target.value)} className="border border-foreground/50 h-9 text-sm" />
                        <Input placeholder="Phone" value={r.phone || ''} onChange={e => updateRecipient(idx, 'phone', e.target.value)} className="border border-foreground/50 h-9 text-sm" />
                        <Input placeholder="City" value={r.city || ''} onChange={e => updateRecipient(idx, 'city', e.target.value)} className="border border-foreground/50 h-9 text-sm" />
                        <Input placeholder="Delivery Address" value={r.address || ''} onChange={e => updateRecipient(idx, 'address', e.target.value)} className="border border-foreground/50 h-9 text-sm md:col-span-2" />
                        <Input placeholder="Personal message (optional)" value={r.personal_message || ''} onChange={e => updateRecipient(idx, 'personal_message', e.target.value)} className="border border-foreground/50 h-9 text-sm md:col-span-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-2 border-foreground p-6 bg-muted shadow-brutal">
                <h3 className="font-display text-lg tracking-wider mb-4 pb-3 border-b-2 border-foreground">ORDER SUMMARY</h3>
                <div className="space-y-2 font-body text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span>{companyName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Products</span><span>{selectedItems.length} items</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Recipients</span><span>{recipients.filter(r => r.name).length}</span></div>
                  {occasion && <div className="flex justify-between"><span className="text-muted-foreground">Occasion</span><span>{occasion}</span></div>}
                  <div className="flex justify-between pt-3 border-t border-foreground/20 font-display text-lg">
                    <span>ESTIMATED TOTAL</span>
                    <span className="text-primary font-bold">UGX {totalCost.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">* Final pricing may vary based on customization and volume. Our team will confirm.</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)} className="font-display text-xs tracking-widest border-2 border-foreground"><ArrowLeft className="h-4 w-4 mr-2" /> BACK</Button>
                <Button onClick={handleSubmit} disabled={submitting || recipients.filter(r => r.name).length === 0} className="font-display text-xs tracking-widest border-2 border-foreground bg-primary">
                  {submitting ? 'SUBMITTING...' : 'SUBMIT GIFT ORDER'} <Gift className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted border-t-2 border-foreground">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-10 tracking-wider">WHY CORPORATE GIFTING WITH EMPINDU?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'MEANINGFUL IMPACT', desc: 'Every gift supports Ugandan artisans and preserves cultural heritage' },
              { icon: Sparkles, title: 'CUSTOM BRANDING', desc: 'Add your company logo, custom packaging, and personalised messages' },
              { icon: Truck, title: 'MANAGED DELIVERY', desc: 'We handle all logistics including packaging and delivery to multiple recipients' },
            ].map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="border-2 border-foreground p-6 bg-background shadow-brutal text-center"
              >
                <b.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-display text-sm tracking-wider mb-2">{b.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CorporateGifting;
