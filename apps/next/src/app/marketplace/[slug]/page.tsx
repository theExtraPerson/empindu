'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useParams } from 'next/navigation';
import { Link } from '@/lib/router-compat';

export default function Page() {
  const params = useParams();
  const { fetchProductBySlug } = useProducts();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params?.slug as string | undefined;
    if (!slug) return;

    setLoading(true);
    fetchProductBySlug(slug).then((result) => {
      setProduct(result);
      setLoading(false);
    });
  }, [params?.slug, fetchProductBySlug]);

  if (loading) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-organic border-2 border-foreground bg-card p-10 text-center text-muted-foreground">
          Loading product...
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-organic border-2 border-foreground bg-card p-10 text-center">
          <p className="font-display text-xl text-secondary mb-4">Product not found</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
          >
            Browse marketplace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-organic border-2 border-foreground bg-card p-8 shadow-brutal">
          <img
            src={product.hero_image_url || '/empinduu.jpg'}
            alt={product.name}
            className="mb-6 w-full rounded-none border-2 border-foreground object-cover"
          />
          <h1 className="font-display text-4xl text-foreground tracking-tight mb-4">{product.name}</h1>
          <p className="text-muted-foreground font-body leading-8 mb-6">{product.description}</p>
          <div className="grid gap-4 text-sm text-muted-foreground">
            <div className="flex justify-between border-t-2 border-foreground pt-4">
              <span>Category</span>
              <span>{product.category}</span>
            </div>
            <div className="flex justify-between border-t-2 border-foreground pt-4">
              <span>Stock</span>
              <span>{product.stock_quantity}</span>
            </div>
            <div className="flex justify-between border-t-2 border-foreground pt-4">
              <span>Price</span>
              <span className="text-secondary">UGX {product.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-organic border-2 border-foreground bg-background p-8 shadow-brutal">
          <div className="rounded-none border-2 border-secondary bg-secondary p-4 text-secondary-foreground">
            <p className="font-display uppercase tracking-[0.35em] text-xs">Buy with impact</p>
          </div>
          <div className="rounded-none border-2 border-foreground p-6 bg-muted">
            <p className="font-display text-sm uppercase tracking-[0.35em] text-muted-foreground mb-2">From the artisan</p>
            <p className="text-foreground font-body leading-7">{product.artisan.full_name}</p>
          </div>
          <button className="w-full rounded-none border-2 border-foreground bg-secondary px-6 py-4 font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90">
            Add to cart
          </button>
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center gap-2 rounded-none border-2 border-foreground bg-background px-6 py-4 text-sm font-display uppercase tracking-[0.35em] text-foreground hover:bg-muted"
          >
            Back to marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
