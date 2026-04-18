'use client';

import { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';

import { Product } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GiftThisModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OCCASIONS = ['birthday', 'anniversary', 'corporate', 'thank_you', 'holiday', 'graduation', 'wedding', 'other'];

export const GiftThisModal = ({ product, open, onOpenChange }: GiftThisModalProps) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState('');
  const [recipientRelationship, setRecipientRelationship] = useState('');
  const [occasion, setOccasion] = useState('birthday');
  const [giftMessage, setGiftMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!recipientName.trim() || !giftMessage.trim()) {
      toast({ title: 'Gift details missing', description: 'Add a recipient and message to continue.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const note = `Gift for ${recipientName}${recipientRelationship ? ` (${recipientRelationship})` : ''}\nOccasion: ${occasion}\nMessage: ${giftMessage}`;
    addItem(product, quantity, note);
    setSubmitting(false);
    onOpenChange(false);
    toast({ title: 'Gift added to cart', description: 'You can finish delivery and payment during checkout.' });
    navigate('/checkout');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl tracking-wider"><Gift className="h-5 w-5 text-primary" /> SEND AS A GIFT</DialogTitle>
          <DialogDescription className="font-body">Personalise {product.name}, then complete payment inside the main checkout flow.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Recipient name *</Label><Input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Who is it for?" /></div>
            <div className="space-y-1"><Label className="text-xs">Relationship</Label><Input value={recipientRelationship} onChange={(event) => setRecipientRelationship(event.target.value)} placeholder="Mother, friend, colleague" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Occasion</Label><Select value={occasion} onValueChange={setOccasion}><SelectTrigger><SelectValue placeholder="Select occasion" /></SelectTrigger><SelectContent>{OCCASIONS.map((option) => <SelectItem key={option} value={option}>{option.replace('_', ' ').toUpperCase()}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Quantity</Label><Input type="number" min={1} max={product.stock_quantity} value={quantity} onChange={(event) => setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))} /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Gift message *</Label><Textarea value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} rows={4} placeholder="Write the message that should travel with the gift." /></div>
          <Button className="w-full border-2 border-foreground font-display text-sm tracking-widest" onClick={handleSubmit} disabled={submitting}>{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</> : <><Gift className="mr-2 h-4 w-4" /> SAVE GIFT DETAILS</>}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};