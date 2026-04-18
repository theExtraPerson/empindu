'use client';

import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export type GiftRecipient = {
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  personal_message?: string;
};

export type GiftItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
  personalization?: string;
};

export type CorporateGiftOrderInput = {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  occasion?: string;
  budget_range?: string;
  delivery_date?: string;
  gift_message?: string;
  branding_notes?: string;
  recipient_count?: number;
  items: GiftItem[];
  recipients: GiftRecipient[];
};

type GiftOrderResponse = {
  id: number;
  customer_name: string;
  customer_email: string;
  company: string;
  notes: string;
  total_items: number;
  total_amount_ugx: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export function useCorporateGifting() {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submitGiftOrder = async (payload: CorporateGiftOrderInput): Promise<boolean> => {
    if (!payload.items.length) {
      toast({
        title: 'No products selected',
        description: 'Add at least one product before submitting your order.',
        variant: 'destructive',
      });
      return false;
    }

    setSubmitting(true);

    try {
      const notes = [
        payload.contact_phone ? `Phone: ${payload.contact_phone}` : null,
        payload.occasion ? `Occasion: ${payload.occasion}` : null,
        payload.budget_range ? `Budget range: ${payload.budget_range}` : null,
        payload.delivery_date ? `Preferred delivery date: ${payload.delivery_date}` : null,
        payload.gift_message ? `Gift message: ${payload.gift_message}` : null,
        payload.branding_notes ? `Branding notes: ${payload.branding_notes}` : null,
        payload.recipient_count ? `Recipient count: ${payload.recipient_count}` : null,
        payload.recipients.length
          ? `Recipients: ${payload.recipients
              .map((recipient, index) =>
                [
                  `#${index + 1} ${recipient.name}`,
                  recipient.email ? `email=${recipient.email}` : null,
                  recipient.phone ? `phone=${recipient.phone}` : null,
                  recipient.city ? `city=${recipient.city}` : null,
                  recipient.address ? `address=${recipient.address}` : null,
                  recipient.personal_message ? `message=${recipient.personal_message}` : null,
                ]
                  .filter(Boolean)
                  .join(', '),
              )
              .join(' | ')}`
          : null,
        payload.items.some((item) => item.personalization)
          ? `Personalization: ${payload.items
              .filter((item) => item.personalization)
              .map((item) => `${item.product_name}: ${item.personalization}`)
              .join(' | ')}`
          : null,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await fetch(`${API_BASE}/gifting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: payload.contact_name,
          customer_email: payload.contact_email,
          company: payload.company_name,
          notes,
          items: payload.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to submit corporate gift order.');
      }

      await response.json() as GiftOrderResponse;

      toast({
        title: 'Order submitted',
        description: 'Your corporate gifting request has been sent successfully.',
      });

      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit corporate gift order.';
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitGiftOrder,
    submitting,
  };
}
