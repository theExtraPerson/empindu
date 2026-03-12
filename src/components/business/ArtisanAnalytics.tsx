import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Package, ShoppingCart, Eye, TrendingUp, Loader2 } from 'lucide-react';

export function ArtisanAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    // Products count
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('artisan_id', user!.id);

    // Get product IDs
    const { data: products } = await supabase.from('products').select('id').eq('artisan_id', user!.id);
    const productIds = (products || []).map(p => p.id);

    let orderCount = 0;
    let revenue = 0;
    let viewCount = 0;

    if (productIds.length > 0) {
      // Order items for this artisan's products
      const { data: orderItems } = await supabase.from('order_items').select('unit_price, quantity, order_id').in('product_id', productIds);
      if (orderItems) {
        const uniqueOrders = new Set(orderItems.map(i => i.order_id));
        orderCount = uniqueOrders.size;
        revenue = orderItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      }

      // Product views
      const { count: vc } = await supabase.from('product_views').select('*', { count: 'exact', head: true }).in('product_id', productIds);
      viewCount = vc || 0;
    }

    setStats({ products: productCount || 0, orders: orderCount, revenue, views: viewCount });
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const cards = [
    { label: 'TOTAL PRODUCTS', value: stats.products, icon: Package, color: 'text-primary' },
    { label: 'TOTAL ORDERS', value: stats.orders, icon: ShoppingCart, color: 'text-secondary' },
    { label: 'TOTAL REVENUE', value: `UGX ${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-accent' },
    { label: 'PRODUCT VIEWS', value: stats.views, icon: Eye, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-secondary" />
        <h2 className="font-display text-2xl font-bold text-foreground">SALES ANALYTICS</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="border-2 border-foreground p-6">
            <card.icon className={`h-8 w-8 mb-3 ${card.color}`} />
            <div className="font-display text-3xl font-bold text-foreground mb-1">{card.value}</div>
            <div className="font-display text-xs tracking-widest text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="border-2 border-foreground p-8 text-center">
        <p className="text-muted-foreground font-body">Detailed charts and trends coming soon. Keep adding products and fulfilling orders to grow your business!</p>
      </div>
    </div>
  );
}
