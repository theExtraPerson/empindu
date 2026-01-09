import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  totalArtisans: number;
  verifiedArtisans: number;
  totalProducts: number;
  availableProducts: number;
  totalBuyers: number;
  totalOrders: number;
  totalSales: number;
  productsByCategory: { category: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrderTrend: { date: string; orders: number; sales: number }[];
}

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Get artisan count
      const { data: artisanRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'artisan');
      
      const artisanIds = artisanRoles?.map(r => r.user_id) || [];
      
      // Get verified artisans
      const { data: verifiedProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .in('user_id', artisanIds.length > 0 ? artisanIds : ['none'])
        .eq('is_verified', true);

      // Get buyer count
      const { data: buyerRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'buyer');

      // Get products
      const { data: allProducts } = await supabase
        .from('products')
        .select('category, is_available, price');

      const availableProducts = allProducts?.filter(p => p.is_available) || [];

      // Group by category
      const categoryMap = new Map<string, number>();
      allProducts?.forEach(p => {
        categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
      });

      const productsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      }));

      // For orders, we need to handle the case where user may not have access
      // We'll provide fallback data for public display
      let totalOrders = 0;
      let totalSales = 0;
      let ordersByStatus: { status: string; count: number }[] = [];
      let recentOrderTrend: { date: string; orders: number; sales: number }[] = [];

      setStats({
        totalArtisans: artisanIds.length,
        verifiedArtisans: verifiedProfiles?.length || 0,
        totalProducts: allProducts?.length || 0,
        availableProducts: availableProducts.length,
        totalBuyers: buyerRoles?.length || 0,
        totalOrders,
        totalSales,
        productsByCategory,
        ordersByStatus,
        recentOrderTrend
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};
