import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Product } from './useProducts';

export const useRecommendations = (currentProductId?: string, limit: number = 8) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const trackProductView = useCallback(async (productId: string, category: string) => {
    try {
      await supabase.from('product_views').insert({
        user_id: user?.id || null,
        product_id: productId,
        category,
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  }, [user?.id]);

  const trackSearch = useCallback(async (searchTerm: string, category?: string) => {
    if (!user?.id || !searchTerm.trim()) return;
    try {
      await supabase.from('search_history').insert({
        user_id: user.id,
        search_term: searchTerm.trim(),
        category: category || null,
      });
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let categoryScores = new Map<string, number>();
        let viewedProductIds = new Set<string>();
        let purchasedProductIds = new Set<string>();

        if (user?.id) {
          // 1. Get recent product views (last 30 days)
          const { data: views } = await supabase
            .from('product_views')
            .select('product_id, category')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

          views?.forEach(v => {
            viewedProductIds.add(v.product_id);
            if (v.category) {
              categoryScores.set(v.category, (categoryScores.get(v.category) || 0) + 1);
            }
          });

          // 2. Get search history categories
          const { data: searches } = await supabase
            .from('search_history')
            .select('search_term, category')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          searches?.forEach(s => {
            if (s.category) {
              categoryScores.set(s.category, (categoryScores.get(s.category) || 0) + 2);
            }
          });

          // 3. Get past purchases
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('buyer_id', user.id);

          if (orders && orders.length > 0) {
            const { data: items } = await supabase
              .from('order_items')
              .select('product_id')
              .in('order_id', orders.map(o => o.id));

            items?.forEach(i => purchasedProductIds.add(i.product_id));

            // Get categories of purchased products
            if (purchasedProductIds.size > 0) {
              const { data: purchasedProducts } = await supabase
                .from('products')
                .select('category')
                .in('id', [...purchasedProductIds]);

              purchasedProducts?.forEach(p => {
                categoryScores.set(p.category, (categoryScores.get(p.category) || 0) + 3);
              });
            }
          }
        }

        // If viewing a specific product, boost its category
        if (currentProductId) {
          const { data: currentProduct } = await supabase
            .from('products')
            .select('category')
            .eq('id', currentProductId)
            .single();

          if (currentProduct) {
            categoryScores.set(currentProduct.category, (categoryScores.get(currentProduct.category) || 0) + 5);
          }
        }

        // Fetch products, prioritizing top categories
        const topCategories = [...categoryScores.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);

        let query = supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('is_available', true)
          .limit(limit * 3);

        if (currentProductId) {
          query = query.neq('id', currentProductId);
        }

        const { data: allProducts } = await query;
        if (!allProducts || allProducts.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // Get artisan profiles
        const artisanIds = [...new Set(allProducts.map(p => p.artisan_id))];
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('user_id, full_name, location, craft_specialty')
          .in('user_id', artisanIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Score products
        const scored = allProducts.map(p => {
          let score = 0;
          // Category match
          const catIndex = topCategories.indexOf(p.category);
          if (catIndex >= 0) score += (3 - catIndex) * 10;
          // Not already purchased = bonus
          if (!purchasedProductIds.has(p.id)) score += 5;
          // Recently viewed = slight penalty (don't re-show)
          if (viewedProductIds.has(p.id)) score -= 2;
          // Randomness for variety
          score += Math.random() * 5;

          return {
            ...p,
            images: p.product_images,
            artisan: profileMap.get(p.artisan_id) || null,
            _score: score,
          };
        });

        scored.sort((a, b) => b._score - a._score);
        setRecommendations(scored.slice(0, limit).map(({ _score, product_images, ...rest }) => rest as any));
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id, currentProductId, limit]);

  return { recommendations, loading, trackProductView, trackSearch };
};
