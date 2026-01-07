import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronDown, ChevronUp, MapPin, Calendar, CreditCard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ReturnRequestDialog } from './ReturnRequestDialog';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  product: {
    id: string;
    name: string;
    is_returnable: boolean;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_method: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
  notes: string | null;
  order_items: OrderItem[];
  pickup_location?: {
    name: string;
    address: string;
    city: string;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

export const OrderHistory = () => {
  const { user } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            product:products (
              id,
              name,
              is_returnable
            )
          ),
          pickup_location:pickup_locations (
            name,
            address,
            city
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user
  });

  const { data: existingReturns } = useQuery({
    queryKey: ['user-returns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('returns')
        .select('order_id, status')
        .eq('buyer_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const canRequestReturn = (order: Order) => {
    if (order.status !== 'delivered') return false;
    if (existingReturns?.some(r => r.order_id === order.id)) return false;
    return order.order_items.some(item => item.product.is_returnable);
  };

  const handleRequestReturn = (order: Order) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-lg font-bold mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const hasReturn = existingReturns?.find(r => r.order_id === order.id);

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Order Header */}
            <div
              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                      <Badge className={statusColors[order.status] || 'bg-gray-100'}>
                        {order.status}
                      </Badge>
                      {hasReturn && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Return: {hasReturn.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'PPP')} • {order.order_items.length} item(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-primary">
                    {formatPrice(order.total_amount)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator />
                  <div className="p-4 space-y-4">
                    {/* Order Items */}
                    <div>
                      <h5 className="font-medium mb-3">Items</h5>
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span>
                              {item.product.name} × {item.quantity}
                              {item.product.is_returnable && (
                                <span className="text-xs text-muted-foreground ml-2">(Returnable)</span>
                              )}
                            </span>
                            <span>{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4" />
                          {order.delivery_method === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
                        </div>
                        {order.delivery_method === 'pickup' && order.pickup_location ? (
                          <p>
                            {order.pickup_location.name}<br />
                            {order.pickup_location.address}, {order.pickup_location.city}
                          </p>
                        ) : (
                          <p>
                            {order.shipping_address}<br />
                            {order.shipping_city}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <CreditCard className="h-4 w-4" />
                          Payment Method
                        </div>
                        <p className="capitalize">{order.payment_method.replace('-', ' ')}</p>
                      </div>
                    </div>

                    {order.notes && (
                      <>
                        <Separator />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Notes: </span>
                          {order.notes}
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    {canRequestReturn(order) && (
                      <>
                        <Separator />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestReturn(order);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Request Return
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={selectedOrder}
        onSuccess={() => {
          refetch();
          setReturnDialogOpen(false);
        }}
      />
    </div>
  );
};
