'use client';

import { Link } from '@/lib/router-compat';
import { Badge } from '@/components/ui/badge';
import { ProductList } from '@/hooks/useProducts';
import heroCrafts from '@/assets/hero-crafts.jpg';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: ProductList;
  index?: number;
}

const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const heroFallback = typeof heroCrafts === 'string' ? heroCrafts : heroCrafts.src;
  const cover = product.hero_image_url || product.images?.[0]?.image_url || heroFallback;

  return (
    <div className="group h-full animate-weave-in opacity-0" style={{ animationDelay: `${index * 40}ms` }}>
      <div className="h-full flex flex-col border-2 border-foreground bg-background shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all duration-300">
        <Link to={`/marketplace/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={cover}
              alt={product.name}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-3 py-1 bg-primary text-primary-foreground font-display text-[10px] tracking-[0.14em] border-2 border-foreground">
                {product.category.toUpperCase()}
              </span>
              {product.artisan.is_certified && (
                <Badge variant="secondary" className="gap-1 border-2 border-foreground font-display text-[10px] tracking-[0.12em]">
                  <ShieldCheck className="h-3 w-3" /> CERTIFIED
                </Badge>
              )}
            </div>
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-background/90 border-2 border-foreground font-display text-xs tracking-widest">
              {product.stock_quantity > 0 ? 'READY TO SHIP' : 'MADE TO ORDER'}
            </div>
          </div>

          <div className="flex-1 p-4 border-t-2 border-foreground flex flex-col gap-3">
            <div>
              <h3 className="font-display text-lg font-bold tracking-wide text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-muted-foreground text-sm font-body leading-snug line-clamp-2 mt-1">
                {product.story_excerpt || product.description}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <span className="font-semibold text-foreground">{product.artisan.full_name}</span>
              <span aria-hidden="true">-</span>
              <span>{product.artisan.community}, {product.artisan.district}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="border-2 border-foreground bg-muted px-3 py-2">
                <p className="text-muted-foreground font-display tracking-[0.12em]">ARTISAN EARNS</p>
                <p className="font-display text-base text-primary">{formatPrice(product.artisan_earnings_ugx)}</p>
              </div>
              <div className="border-2 border-foreground bg-muted px-3 py-2">
                <p className="text-muted-foreground font-display tracking-[0.12em]">HERITAGE FUND</p>
                <p className="font-display text-base text-secondary">{formatPrice(product.heritage_fund_ugx)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dashed border-foreground/40">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-secondary" />
                Story-first craft
              </div>
              <div className="font-display text-xl font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
            </div>
          </div>
        </Link>

        <div className="border-t-2 border-foreground p-4">
          <Link
            to={`/marketplace/${product.slug}`}
            className="inline-flex min-h-[44px] w-full items-center justify-center border-2 border-foreground bg-secondary px-4 py-3 font-display text-xs uppercase tracking-[0.22em] text-secondary-foreground transition-all hover:bg-secondary/90"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
};





