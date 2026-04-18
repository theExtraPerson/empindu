'use client';

import { useEffect, useState } from 'react';

import { getProduct, getProducts } from '@/lib/api';
import type { ProductList } from '@/hooks/useProducts';

export function useRecommendations(currentProductId?: string, limit = 4) {
  const [recommendations, setRecommendations] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      try {
        const allProducts = await getProducts({ page_size: Math.max(limit * 3, 12) });
        let filtered = allProducts;

        if (currentProductId) {
          const currentProduct = await getProduct(currentProductId).catch(() => null);
          if (currentProduct?.artisan?.craft_tradition) {
            filtered = allProducts.filter(
              (item) =>
                item.id !== Number(currentProductId) &&
                item.artisan.craft_tradition === currentProduct.artisan.craft_tradition
            );
          } else {
            filtered = allProducts.filter((item) => item.id !== Number(currentProductId));
          }
        }

        if (!cancelled) {
          setRecommendations(
            filtered.slice(0, limit).map((item) => ({
              ...item,
              price: item.price_ugx,
              stock_quantity: item.stock,
              is_available: item.stock > 0,
              description: item.story,
              category: item.artisan.craft_tradition,
              hero_image_url: item.hero_photo_url,
              story_excerpt: item.story,
              images: item.hero_photo_url
                ? [{ image_url: item.hero_photo_url, is_primary: true, display_order: 0 }]
                : [],
            }))
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [currentProductId, limit]);

  const trackSearch = async (_query?: string, _craftType?: string) => undefined;
  const trackProductView = async (_productId?: string) => undefined;

  return { recommendations, loading, trackSearch, trackProductView };
}
