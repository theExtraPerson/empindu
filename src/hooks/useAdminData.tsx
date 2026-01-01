import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/hooks/useProducts';

export interface ArtisanProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  craft_specialty: string | null;
  location: string | null;
  is_verified: boolean | null;
  years_experience: number | null;
  created_at: string;
}

export interface PlatformStats {
  totalArtisans: number;
  verifiedArtisans: number;
  totalProducts: number;
  availableProducts: number;
  totalBuyers: number;
  productsByCategory: { category: string; count: number }[];
}

export const useAdminData = () => {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArtisans = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'artisan');

    if (roles && roles.length > 0) {
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      setArtisans(profiles || []);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    setProducts(data || []);
  };

  const fetchStats = async () => {
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
      .in('user_id', artisanIds)
      .eq('is_verified', true);

    // Get buyer count
    const { data: buyerRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'buyer');

    // Get products
    const { data: allProducts } = await supabase
      .from('products')
      .select('*');

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

    setStats({
      totalArtisans: artisanIds.length,
      verifiedArtisans: verifiedProfiles?.length || 0,
      totalProducts: allProducts?.length || 0,
      availableProducts: availableProducts.length,
      totalBuyers: buyerRoles?.length || 0,
      productsByCategory
    });
  };

  const verifyArtisan = async (userId: string, verified: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: verified })
      .eq('user_id', userId);
    
    if (!error) {
      await fetchArtisans();
      await fetchStats();
    }
    return { error };
  };

  const toggleProductAvailability = async (productId: string, available: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: available })
      .eq('id', productId);
    
    if (!error) {
      await fetchProducts();
      await fetchStats();
    }
    return { error };
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (!error) {
      await fetchProducts();
      await fetchStats();
    }
    return { error };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchArtisans(), fetchProducts(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    artisans,
    products,
    stats,
    loading,
    verifyArtisan,
    toggleProductAvailability,
    deleteProduct,
    refetch: () => Promise.all([fetchArtisans(), fetchProducts(), fetchStats()])
  };
};
