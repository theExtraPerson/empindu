'use client';

import { useMemo, useState } from 'react';

import { useArtisans } from '@/hooks/useArtisans';
import { type Product, useProducts } from '@/hooks/useProducts';

export interface ArtisanProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  craft_specialty: string | null;
  location: string | null;
  years_experience: number;
  is_verified: boolean;
}

export interface PlatformStats {
  totalArtisans: number;
  verifiedArtisans: number;
  totalProducts: number;
  availableProducts: number;
  totalBuyers: number;
  productsByCategory: Array<{
    name: string;
    count: number;
  }>;
}

export function useAdminData() {
  const { artisans: sourceArtisans, loading: artisansLoading } = useArtisans();
  const { products: sourceProducts, loading: productsLoading } = useProducts();
  const [verifiedOverrides, setVerifiedOverrides] = useState<Record<string, boolean>>({});
  const [availabilityOverrides, setAvailabilityOverrides] = useState<Record<string, boolean>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([]);

  const artisans = useMemo<ArtisanProfile[]>(() => {
    return sourceArtisans.map((artisan) => {
      const userId = artisan.slug;
      return {
        id: artisan.slug,
        user_id: userId,
        full_name: artisan.full_name,
        avatar_url: artisan.profile_photo_url,
        craft_specialty: artisan.craft_tradition,
        location: [artisan.community, artisan.district].filter(Boolean).join(', ') || null,
        years_experience: artisan.years_experience,
        is_verified: verifiedOverrides[userId] ?? artisan.is_certified,
      };
    });
  }, [sourceArtisans, verifiedOverrides]);

  const products = useMemo<Product[]>(() => {
    return sourceProducts
      .filter((product) => !deletedProductIds.includes(String(product.id)))
      .map((product): Product => ({
        ...product,
        material: '',
        technique: '',
        days_to_make: 0,
        is_customisable: false,
        provenance: null,
        photos: [],
        is_available: availabilityOverrides[String(product.id)] ?? product.is_available,
      }));
  }, [availabilityOverrides, deletedProductIds, sourceProducts]);

  const stats = useMemo<PlatformStats>(() => {
    const productsByCategoryMap = products.reduce<Map<string, number>>((acc, product) => {
      const key = product.category || 'Uncategorized';
      acc.set(key, (acc.get(key) || 0) + 1);
      return acc;
    }, new Map());

    return {
      totalArtisans: artisans.length,
      verifiedArtisans: artisans.filter((artisan) => artisan.is_verified).length,
      totalProducts: products.length,
      availableProducts: products.filter((product) => product.is_available).length,
      totalBuyers: 0,
      productsByCategory: Array.from(productsByCategoryMap.entries()).map(([name, count]) => ({ name, count })),
    };
  }, [artisans, products]);

  const verifyArtisan = async (userId: string, verified: boolean) => {
    setVerifiedOverrides((current) => ({
      ...current,
      [userId]: verified,
    }));

    return { error: null };
  };

  const toggleProductAvailability = async (productId: string, available: boolean) => {
    setAvailabilityOverrides((current) => ({
      ...current,
      [productId]: available,
    }));

    return { error: null };
  };

  const deleteProduct = async (productId: string) => {
    setDeletedProductIds((current) => (current.includes(productId) ? current : [...current, productId]));
    return { error: null };
  };

  return {
    artisans,
    products,
    stats,
    loading: artisansLoading || productsLoading,
    verifyArtisan,
    toggleProductAvailability,
    deleteProduct,
  };
}
