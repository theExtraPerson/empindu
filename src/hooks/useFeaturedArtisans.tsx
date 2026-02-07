import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedArtisan {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  craft_specialty: string | null;
  location: string | null;
  years_experience: number | null;
  is_verified: boolean;
  product_count: number;
  total_sales: number;
}

export const useFeaturedArtisans = (limit: number = 4) => {
  const [artisans, setArtisans] = useState<FeaturedArtisan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedArtisans = async () => {
      try {
        // Get artisan user IDs
        const { data: artisanRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'artisan');

        if (!artisanRoles || artisanRoles.length === 0) {
          setArtisans([]);
          setLoading(false);
          return;
        }

        const artisanIds = artisanRoles.map(r => r.user_id);

        // Get public profiles for these artisans
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('*')
          .in('user_id', artisanIds);

        if (!profiles || profiles.length === 0) {
          setArtisans([]);
          setLoading(false);
          return;
        }

        // Get product counts per artisan
        const { data: products } = await supabase
          .from('products')
          .select('artisan_id, id')
          .in('artisan_id', artisanIds);

        // Count products per artisan
        const productCounts = new Map<string, number>();
        products?.forEach(p => {
          productCounts.set(p.artisan_id, (productCounts.get(p.artisan_id) || 0) + 1);
        });

        // Get order items to calculate sales per artisan
        const productIds = products?.map(p => p.id) || [];
        let salesCounts = new Map<string, number>();
        
        if (productIds.length > 0) {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, quantity')
            .in('product_id', productIds);

          // Map product_id back to artisan_id and sum quantities
          const productToArtisan = new Map<string, string>();
          products?.forEach(p => {
            productToArtisan.set(p.id, p.artisan_id);
          });

          orderItems?.forEach(item => {
            const artisanId = productToArtisan.get(item.product_id);
            if (artisanId) {
              salesCounts.set(artisanId, (salesCounts.get(artisanId) || 0) + item.quantity);
            }
          });
        }

        // Combine data and score artisans
        const scoredArtisans = profiles.map(profile => {
          const userId = profile.user_id!;
          const productCount = productCounts.get(userId) || 0;
          const totalSales = salesCounts.get(userId) || 0;
          const isVerified = profile.is_verified || false;
          
          // Score: verified (10 points) + products (1 point each, max 20) + sales (2 points each, max 40)
          const score = 
            (isVerified ? 10 : 0) + 
            Math.min(productCount, 20) + 
            Math.min(totalSales * 2, 40);

          return {
            id: profile.user_id!,
            user_id: profile.user_id!,
            full_name: profile.full_name || 'Artisan',
            avatar_url: profile.avatar_url,
            craft_specialty: profile.craft_specialty,
            location: profile.location,
            years_experience: profile.years_experience,
            is_verified: isVerified,
            product_count: productCount,
            total_sales: totalSales,
            _score: score,
          };
        });

        // Sort by score descending and take top artisans
        scoredArtisans.sort((a, b) => b._score - a._score);
        
        // Filter to only show artisans with at least some activity
        const activeArtisans = scoredArtisans.filter(a => a.product_count > 0 || a.is_verified);
        
        // Take top N artisans, or fall back to any artisans if none are active
        const topArtisans = activeArtisans.length > 0 
          ? activeArtisans.slice(0, limit)
          : scoredArtisans.slice(0, limit);

        setArtisans(topArtisans.map(({ _score, ...rest }) => rest));
      } catch (error) {
        console.error('Error fetching featured artisans:', error);
        setArtisans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArtisans();
  }, [limit]);

  return { artisans, loading };
};
