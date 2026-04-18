import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Gift, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { GiftOrderTimeline } from './GiftOrderTimeline';

const statusVariant = (status: string) => {
  switch (status) {
    case 'delivered': return 'default';
    case 'cancelled': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'outline';
  }
};

export const MyGiftOrders = () => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-gift-orders', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_gift_orders')
        .select(`
          *,
          corporate_gift_items (
            id, quantity, unit_price, personalization,
            products:product_id ( name )
          ),
          corporate_gift_recipients ( name, email, city )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-background border-2 border-foreground p-10 text-center shadow-brutal">
        <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-lg font-bold tracking-wider mb-2">NO GIFT ORDERS YET</h3>
        <p className="text-muted-foreground font-body text-sm">
          When you send a product as a gift, your orders will appear here.
        </p>
      </div>
    );
  }

  const formatPrice = (n: number) => `UGX ${n.toLocaleString()}`;

  return (
    <div className="space-y-4">
      {orders.map((order: any) => {
        const isExpanded = expandedId === order.id;
        const totalAmount = (order.corporate_gift_items || []).reduce(
          (sum: number, item: any) => sum + item.quantity * item.unit_price, 0
        );

        return (
          <div key={order.id} className="bg-background border-2 border-foreground shadow-brutal">
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <Gift className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold tracking-wider truncate">
                    {order.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                    {order.occasion && ` · ${order.occasion}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-display text-sm font-bold hidden sm:block">
                  {formatPrice(totalAmount)}
                </span>
                <Badge variant={statusVariant(order.status)} className="capitalize font-display text-[10px] tracking-widest">
                  {order.status.replace('_', ' ')}
                </Badge>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t-2 border-foreground p-4 md:p-6 space-y-6">
                {/* Items */}
                <div>
                  <h4 className="font-display text-xs tracking-widest text-muted-foreground mb-3">ITEMS</h4>
                  <div className="space-y-2">
                    {(order.corporate_gift_items || []).map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm font-body">
                        <span>
                          {item.products?.name || 'Product'} × {item.quantity}
                        </span>
                        <span className="font-display font-bold">
                          {formatPrice(item.quantity * item.unit_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                {(order.corporate_gift_recipients || []).length > 0 && (
                  <div>
                    <h4 className="font-display text-xs tracking-widest text-muted-foreground mb-3">RECIPIENT</h4>
                    {(order.corporate_gift_recipients || []).map((r: any, i: number) => (
                      <div key={i} className="text-sm font-body text-muted-foreground">
                        <span className="text-foreground font-medium">{r.name}</span>
                        {r.city && ` — ${r.city}`}
                        {r.email && ` · ${r.email}`}
                      </div>
                    ))}
                  </div>
                )}

                {/* Gift message */}
                {order.gift_message && (
                  <div>
                    <h4 className="font-display text-xs tracking-widest text-muted-foreground mb-2">GIFT MESSAGE</h4>
                    <p className="text-sm font-body italic text-muted-foreground">"{order.gift_message}"</p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-display text-xs tracking-widest text-muted-foreground mb-3">STATUS HISTORY</h4>
                  <GiftOrderTimeline giftOrderId={order.id} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
