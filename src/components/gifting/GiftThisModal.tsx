import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCorporateGifting } from '@/hooks/useCorporateGifting';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useProducts';

interface GiftThisModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OCCASIONS = ['Birthday', 'Anniversary', 'Corporate Event', 'Thank You', 'Holiday', 'Graduation', 'Wedding', 'Other'];

export const GiftThisModal = ({ product, open, onOpenChange }: GiftThisModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { submitGiftOrder, submitting } = useCorporateGifting();
  const { toast } = useToast();

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientCity, setRecipientCity] = useState('');
  const [occasion, setOccasion] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to sign in to send a gift', variant: 'destructive' });
      navigate('/auth');
      return;
    }

    if (!senderName.trim() || !senderEmail.trim() || !recipientName.trim()) {
      toast({ title: 'Missing info', description: 'Please fill in sender name, email, and recipient name', variant: 'destructive' });
      return;
    }

    const success = await submitGiftOrder({
      company_name: `Gift from ${senderName}`,
      contact_name: senderName,
      contact_email: senderEmail,
      contact_phone: senderPhone || undefined,
      occasion: occasion || undefined,
      gift_message: giftMessage || undefined,
      recipient_count: 1,
      items: [{
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        image_url: product.images?.[0]?.image_url,
      }],
      recipients: [{
        name: recipientName,
        email: recipientEmail || undefined,
        phone: recipientPhone || undefined,
        address: recipientAddress || undefined,
        city: recipientCity || undefined,
        personal_message: giftMessage || undefined,
      }],
    });

    if (success) {
      onOpenChange(false);
      // Reset form
      setSenderName(''); setSenderEmail(''); setSenderPhone('');
      setRecipientName(''); setRecipientEmail(''); setRecipientPhone('');
      setRecipientAddress(''); setRecipientCity('');
      setOccasion(''); setGiftMessage(''); setQuantity(1);
    }
  };

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wider flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            GIFT THIS PRODUCT
          </DialogTitle>
          <DialogDescription className="font-body">
            Send <strong>{product.name}</strong> as a gift — {formatPrice(product.price)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Sender Info */}
          <div className="space-y-3">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground">YOUR DETAILS (SENDER)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email *</Label>
                <Input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone (optional)</Label>
              <Input value={senderPhone} onChange={e => setSenderPhone(e.target.value)} placeholder="+256..." />
            </div>
          </div>

          {/* Recipient Info */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground">RECIPIENT DETAILS</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Recipient name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="recipient@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="+256..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input value={recipientCity} onChange={e => setRecipientCity(e.target.value)} placeholder="Kampala" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Delivery Address</Label>
              <Input value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} placeholder="Street address..." />
            </div>
          </div>

          {/* Gift Details */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-display text-xs tracking-widest text-muted-foreground">GIFT DETAILS</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Quantity</Label>
                <Input type="number" min={1} max={product.stock_quantity} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gift Message</Label>
              <Textarea
                value={giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                placeholder="Write a personal message for the recipient..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{giftMessage.length}/500</p>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
            <Button
              className="w-full h-12 font-display text-sm tracking-widest border-2 border-foreground"
              onClick={handleSubmit}
              disabled={submitting || !senderName.trim() || !senderEmail.trim() || !recipientName.trim()}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> PROCESSING...</>
              ) : (
                <><Gift className="h-4 w-4 mr-2" /> SEND AS GIFT</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
