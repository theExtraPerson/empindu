import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Package, Loader2, Calendar, DollarSign } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: { name: string; category: string } | null;
  order: {
    id: string;
    status: string;
    created_at: string;
    total_amount: number;
    shipping_city: string;
    shipping_country: string;
    delivery_method: string;
    payment_method: string;
  } | null;
}

export function ArtisanOrdersView() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    // Get products belonging to this artisan, then their order items
    const { data: products } = await supabase.from('products').select('id, name, category').eq('artisan_id', user!.id);
    if (!products || products.length === 0) { setLoading(false); return; }

    const productIds = products.map(p => p.id);
    const productMap = new Map(products.map(p => [p.id, { name: p.name, category: p.category }]));

    const { data: items } = await supabase.from('order_items').select('id, quantity, unit_price, product_id, order_id').in('product_id', productIds).order('created_at', { ascending: false });

    if (!items || items.length === 0) { setLoading(false); return; }

    const orderIds = [...new Set(items.map(i => i.order_id))];
    const { data: orderData } = await supabase.from('orders').select('id, status, created_at, total_amount, shipping_city, shipping_country, delivery_method, payment_method').in('id', orderIds);

    const orderMap = new Map((orderData || []).map(o => [o.id, o]));

    setOrders(items.map(item => ({
      ...item,
      product: productMap.get(item.product_id) || null,
      order: orderMap.get(item.order_id) || null,
    })));
    setLoading(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-secondary/20 text-secondary-foreground',
    confirmed: 'bg-accent/20 text-accent-foreground',
    processing: 'bg-primary/20 text-primary-foreground',
    shipped: 'bg-secondary/30 text-secondary-foreground',
    delivered: 'bg-accent/30 text-accent-foreground',
    cancelled: 'bg-destructive/20 text-destructive',
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-foreground/30">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-display text-xl text-foreground mb-2">NO ORDERS YET</h3>
        <p className="text-muted-foreground font-body">Orders for your products will appear here.</p>
      </div>
    );
  }

  // Group by order
  const grouped = orders.reduce((acc, item) => {
    const orderId = item.order?.id || 'unknown';
    if (!acc[orderId]) acc[orderId] = { order: item.order, items: [] };
    acc[orderId].items.push(item);
    return acc;
  }, {} as Record<string, { order: typeof orders[0]['order']; items: typeof orders }>);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">YOUR ORDERS</h2>
      {Object.entries(grouped).map(([orderId, { order, items }]) => (
        <motion.div key={orderId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-foreground p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-foreground/20">
            <div className="flex items-center gap-3">
              <span className="font-display text-xs tracking-widest text-muted-foreground">ORDER #{orderId.slice(0, 8).toUpperCase()}</span>
              {order && <Badge className={`font-display text-xs tracking-wider ${statusColors[order.status] || 'bg-muted'}`}>{order.status.toUpperCase()}</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm font-body text-muted-foreground">
              {order && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(order.created_at).toLocaleDateString()}</span>}
              {order && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />UGX {items.reduce((s, i) => s + i.unit_price * i.quantity, 0).toLocaleString()}</span>}
            </div>
          </div>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <span className="font-display text-sm font-bold text-foreground">{item.product?.name || 'Unknown Product'}</span>
                  <span className="text-xs text-muted-foreground font-body ml-2">× {item.quantity}</span>
                </div>
                <span className="font-display text-sm text-secondary">UGX {(item.unit_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          {order && (
            <div className="mt-4 pt-3 border-t border-foreground/10 flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
              <span>{order.shipping_city}, {order.shipping_country}</span>
              <span>{order.delivery_method}</span>
              <span>{order.payment_method}</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
