'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

export default function Page() {
  const { products, loading } = useProducts();

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 border-2 border-foreground bg-card p-8 shadow-brutal">
          <span className="inline-block border-2 border-secondary px-3 py-1 font-display text-xs tracking-[0.35em] uppercase text-secondary-foreground mb-4">
            Marketplace
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-foreground tracking-tight">Curated heritage goods from Uganda’s finest makers.</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground font-body leading-8">
            Explore artisan collections, discover provenance, and choose gifts that support communities downstream.
          </p>
        </div>

        {loading ? (
          <div className="rounded-organic border-2 border-foreground bg-background p-10 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.slug} index={index} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
