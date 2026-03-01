import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ArtisanReview {
  id: string;
  artisan_id: string;
  reviewer_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  distribution: Record<number, number>;
}

export const useArtisanReviews = (artisanId?: string) => {
  const [reviews, setReviews] = useState<ArtisanReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average_rating: 0, total_reviews: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<{ id: string; created_at: string }[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    if (!artisanId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artisan_reviews')
        .select('*')
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get reviewer names from public_profiles
      const reviewerIds = [...new Set(data?.map(r => r.reviewer_id) || [])];
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', reviewerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const enriched = (data || []).map(r => ({
        ...r,
        reviewer_name: profileMap.get(r.reviewer_id)?.full_name || 'Anonymous',
        reviewer_avatar: profileMap.get(r.reviewer_id)?.avatar_url || undefined,
      }));

      setReviews(enriched);

      // Calculate stats
      const total = enriched.length;
      const avg = total > 0 ? enriched.reduce((s, r) => s + r.rating, 0) / total : 0;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      enriched.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
      setStats({ average_rating: Math.round(avg * 10) / 10, total_reviews: total, distribution: dist });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [artisanId]);

  // Check if current user can review this artisan
  useEffect(() => {
    if (!user || !artisanId) { setCanReview(false); return; }

    const checkEligibility = async () => {
      // Find delivered orders from this user that contain products by this artisan
      const { data: orders } = await supabase
        .from('orders')
        .select('id, created_at')
        .eq('buyer_id', user.id)
        .eq('status', 'delivered');

      if (!orders || orders.length === 0) { setCanReview(false); return; }

      // Check which orders have products from this artisan
      const orderIds = orders.map(o => o.id);
      const { data: items } = await supabase
        .from('order_items')
        .select('order_id, product_id')
        .in('order_id', orderIds);

      if (!items || items.length === 0) { setCanReview(false); return; }

      const productIds = [...new Set(items.map(i => i.product_id))];
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .in('id', productIds)
        .eq('artisan_id', artisanId);

      if (!products || products.length === 0) { setCanReview(false); return; }

      const artisanProductIds = new Set(products.map(p => p.id));
      const eligibleOrderIds = new Set(
        items.filter(i => artisanProductIds.has(i.product_id)).map(i => i.order_id)
      );

      // Filter out orders already reviewed
      const { data: existingReviews } = await supabase
        .from('artisan_reviews')
        .select('order_id')
        .eq('artisan_id', artisanId)
        .eq('reviewer_id', user.id);

      const reviewedOrderIds = new Set(existingReviews?.map(r => r.order_id) || []);
      const unreviewedOrders = orders.filter(o => eligibleOrderIds.has(o.id) && !reviewedOrderIds.has(o.id));

      setEligibleOrders(unreviewedOrders);
      setCanReview(unreviewedOrders.length > 0);
    };

    checkEligibility();
  }, [user, artisanId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submitReview = async (data: { rating: number; title?: string; comment?: string; order_id: string }) => {
    if (!user || !artisanId) return false;
    try {
      const { error } = await supabase.from('artisan_reviews').insert({
        artisan_id: artisanId,
        reviewer_id: user.id,
        order_id: data.order_id,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
      });
      if (error) throw error;
      toast({ title: 'Review submitted', description: 'Thank you for your feedback!' });
      await fetchReviews();
      // Update eligibility
      setEligibleOrders(prev => prev.filter(o => o.id !== data.order_id));
      setCanReview(eligibleOrders.length > 1);
      return true;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to submit review', variant: 'destructive' });
      return false;
    }
  };

  return { reviews, stats, loading, canReview, eligibleOrders, submitReview, fetchReviews };
};
