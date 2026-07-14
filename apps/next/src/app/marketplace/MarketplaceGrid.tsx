'use client';

import { useMemo } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import type { ProductList as ApiProductList } from '@/lib/api';
import type { ProductList } from '@/hooks/useProducts';

function normalize(p: ApiProductList): ProductList {
  return {
    ...p,
    price: p.price_ugx,
    stock_quantity: p.stock,
    is_available: p.stock > 0,
    description: p.story,
    category: p.artisan.craft_tradition,
    hero_image_url: p.hero_photo_url,
    story_excerpt: p.story ? `${p.story.slice(0, 150)}${p.story.length > 150 ? '...' : ''}` : '',
    images: p.hero_photo_url
      ? [{ image_url: p.hero_photo_url, is_primary: true, display_order: 0 }]
      : [],
  };
}

export function MarketplaceGrid({
  initialProducts,
  searchQuery = '',
}: {
  initialProducts: ApiProductList[];
  searchQuery?: string;
}) {
  const products = useMemo(() => {
    const all = initialProducts.map(normalize);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) =>
      [p.name, p.description, p.artisan.full_name, p.artisan.community, p.category]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q)),
    );
  }, [initialProducts, searchQuery]);

  if (products.length === 0) {
    return (
      <div className="border-2 border-foreground bg-card p-10 text-center shadow-brutal animate-weave-in">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {searchQuery
            ? `No pieces match "${searchQuery}". Try clearing filters.`
            : 'The marketplace is being restocked. Check back soon.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.slug} index={index} product={product} />
      ))}
    </div>
  );
}
