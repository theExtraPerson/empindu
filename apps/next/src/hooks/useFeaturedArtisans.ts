'use client';

import { useMemo } from 'react';

import { useArtisans } from '@/hooks/useArtisans';
import { useProducts } from '@/hooks/useProducts';

interface FeaturedArtisan {
  slug: string;
  full_name: string;
  avatar_url: string | null;
  craft_specialty: string | null;
  location: string | null;
  years_experience: number;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  product_count: number;
  total_sales: number;
}

export function useFeaturedArtisans(limit = 4) {
  const { artisans, loading: artisansLoading } = useArtisans();
  const { products, loading: productsLoading } = useProducts();

  const featured = useMemo<FeaturedArtisan[]>(() => {
    return artisans.slice(0, limit).map((artisan) => {
      const productCount = products.filter((product) => product.artisan.slug === artisan.slug).length;

      return {
        slug: artisan.slug,
        full_name: artisan.full_name,
        avatar_url: artisan.profile_photo_url,
        craft_specialty: artisan.craft_tradition,
        location: [artisan.community, artisan.district].filter(Boolean).join(', ') || null,
        years_experience: artisan.years_experience,
        is_verified: artisan.is_certified,
        avg_rating: 0,
        review_count: 0,
        product_count: productCount,
        total_sales: artisan.order_count || 0,
      };
    });
  }, [artisans, limit, products]);

  return {
    artisans: featured,
    loading: artisansLoading || productsLoading,
  };
}
