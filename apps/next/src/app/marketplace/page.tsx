'use client';

import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';

export default function Page() {
  const { products, loading } = useProducts();

  return (
    <section className="min-h-screen bg-background px-4 py-16 text-foreground sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-2 border-foreground bg-card p-5 shadow-brutal sm:mb-10 sm:p-8">
          <span className="mb-4 inline-block border-2 border-secondary px-3 py-1 font-display text-xs uppercase tracking-[0.35em] text-secondary-foreground">
            Marketplace
          </span>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Curated heritage goods from Uganda's finest makers.
          </h1>
          <p className="mt-4 max-w-3xl font-body leading-8 text-muted-foreground">
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
