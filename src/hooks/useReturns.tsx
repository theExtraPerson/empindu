import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Return {
  id: string;
  order_id: string;
  buyer_id: string;
  reason: string;
  description: string | null;
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'completed';
  refund_amount: number | null;
  refund_method: string | null;
  admin_notes: string | null;
  pickup_scheduled_at: string | null;
  received_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  condition: 'unopened' | 'like_new' | 'used' | 'damaged' | null;
  reason: string | null;
}

export interface CreateReturnData {
  order_id: string;
  reason: string;
  description?: string;
  items: {
    order_item_id: string;
    quantity: number;
    condition?: 'unopened' | 'like_new' | 'used' | 'damaged';
    reason?: string;
  }[];
}

export const useReturns = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createReturn = async (returnData: CreateReturnData): Promise<Return | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request a return",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      // Create the return record
      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert({
          order_id: returnData.order_id,
          buyer_id: user.id,
          reason: returnData.reason,
          description: returnData.description
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Create return items
      const returnItems = returnData.items.map(item => ({
        return_id: returnRecord.id,
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        condition: item.condition,
        reason: item.reason
      }));

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Return Requested",
        description: "Your return request has been submitted. We'll review it shortly."
      });

      return returnRecord as Return;
    } catch (error: any) {
      console.error('Error creating return:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create return request",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReturns = async (): Promise<Return[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as Return[];
    } catch (error: any) {
      console.error('Error fetching returns:', error);
      return [];
    }
  };

  return {
    loading,
    createReturn,
    fetchUserReturns
  };
};

export const RETURN_REASONS = [
  { value: 'defective', label: 'Product is defective or damaged' },
  { value: 'not_as_described', label: 'Product not as described' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'quality', label: 'Quality not as expected' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other reason' }
];

export const ITEM_CONDITIONS = [
  { value: 'unopened', label: 'Unopened / Sealed' },
  { value: 'like_new', label: 'Like New (opened but unused)' },
  { value: 'used', label: 'Used' },
  { value: 'damaged', label: 'Damaged' }
];
