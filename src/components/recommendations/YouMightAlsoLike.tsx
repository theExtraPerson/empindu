import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { ProductCard } from '@/components/products/ProductCard';

interface Props {
  currentProductId?: string;
  title?: string;
  limit?: number;
}

export function YouMightAlsoLike({ currentProductId, title = 'YOU MIGHT ALSO LIKE', limit = 4 }: Props) {
  const { recommendations, loading } = useRecommendations(currentProductId, limit);

  if (loading) {
    return (
      <section className="py-12 bg-muted border-t-2 border-foreground">
        <div className="container mx-auto px-4 flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-muted border-t-2 border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <Sparkles className="h-5 w-5 text-[hsl(var(--kente-gold))]" />
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wider">{title}</h2>
          <div className="flex-1 h-0.5 bg-foreground/20" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {recommendations.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
