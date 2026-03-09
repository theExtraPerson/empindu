import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface GiftRecipient {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  personal_message?: string;
}

export interface GiftItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  personalization?: string;
  image_url?: string;
}

export interface CorporateGiftOrder {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  occasion?: string;
  budget_range?: string;
  delivery_date?: string;
  gift_message?: string;
  branding_notes?: string;
  recipient_count: number;
  items: GiftItem[];
  recipients: GiftRecipient[];
}

export const useCorporateGifting = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const submitGiftOrder = async (order: CorporateGiftOrder): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to place a corporate gift order', variant: 'destructive' });
      return false;
    }

    setSubmitting(true);
    try {
      // 1. Create gift order
      const { data: giftOrder, error: orderError } = await supabase
        .from('corporate_gift_orders')
        .insert({
          user_id: user.id,
          company_name: order.company_name,
          contact_name: order.contact_name,
          contact_email: order.contact_email,
          contact_phone: order.contact_phone || null,
          occasion: order.occasion || null,
          budget_range: order.budget_range || null,
          delivery_date: order.delivery_date || null,
          gift_message: order.gift_message || null,
          branding_notes: order.branding_notes || null,
          recipient_count: order.recipient_count,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create gift items
      if (order.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('corporate_gift_items')
          .insert(
            order.items.map(item => ({
              gift_order_id: giftOrder.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              personalization: item.personalization || null,
            }))
          );
        if (itemsError) throw itemsError;
      }

      // 3. Create recipients
      if (order.recipients.length > 0) {
        const { error: recipientsError } = await supabase
          .from('corporate_gift_recipients')
          .insert(
            order.recipients.map(r => ({
              gift_order_id: giftOrder.id,
              name: r.name,
              email: r.email || null,
              phone: r.phone || null,
              address: r.address || null,
              city: r.city || null,
              personal_message: r.personal_message || null,
            }))
          );
        if (recipientsError) throw recipientsError;
      }

      // 4. Log initial status in history
      await supabase.from('gift_order_status_history').insert({
        gift_order_id: giftOrder.id,
        old_status: null,
        new_status: 'pending',
        changed_by: user.id,
      });

      // 5. Send confirmation email (fire-and-forget)
      supabase.functions.invoke('send-gift-confirmation', {
        body: { giftOrderId: giftOrder.id },
      }).catch(err => console.error('Gift confirmation email failed:', err));

      toast({ title: 'Gift order submitted!', description: 'Our team will contact you within 24 hours to confirm details.' });
      return true;
    } catch (err: any) {
      console.error('Error submitting gift order:', err);
      toast({ title: 'Error', description: err.message || 'Failed to submit gift order', variant: 'destructive' });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitGiftOrder, submitting };
};
