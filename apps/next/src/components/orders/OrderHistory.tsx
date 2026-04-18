'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronDown, ChevronUp, CreditCard, Package, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { getOrders, getReturnRequests, type Order as ApiOrder } from '@/lib/api';
import { ReturnRequestDialog } from './ReturnRequestDialog';

const statusColors: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-purple-100 text-purple-800',
  dispatched: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

export const OrderHistory = () => {
  const { user } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

  const buyerEmail = user?.email || null;

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['user-orders', buyerEmail],
    queryFn: () => getOrders({ buyer_email: buyerEmail || undefined }),
    enabled: !!buyerEmail,
  });

  const { data: returnMap = {} } = useQuery({
    queryKey: ['user-returns', orders.map((order) => order.id).join(',')],
    queryFn: async () => {
      const entries = await Promise.all(
        orders.map(async (order) => [order.id, await getReturnRequests(order.id)] as const)
      );
      return Object.fromEntries(entries);
    },
    enabled: orders.length > 0,
  });

  const handleRequestReturn = (order: ApiOrder) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  if (!buyerEmail) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-display text-lg font-bold">Order History Needs Buyer Context</h3>
        <p className="text-muted-foreground">
          Connect authenticated buyer email to load order history from the Django commerce API.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-display text-lg font-bold">No Orders Yet</h3>
        <p className="text-muted-foreground">Your Django-backed order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const returns = returnMap[order.id] || [];
        const latestReturn = returns[0] || null;
        const canRequestReturn = order.status === 'delivered' && !latestReturn;

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <div
              className="cursor-pointer p-4 transition-colors hover:bg-muted/30"
              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Order #{String(order.id).padStart(5, '0')}</h4>
                      <Badge className={statusColors[order.status] || 'bg-gray-100'}>{order.status}</Badge>
                      {latestReturn && (
                        <Badge variant="outline" className="border-orange-300 text-orange-600">
                          Return: {latestReturn.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), 'PPP')} · {order.product_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-bold text-primary">{formatPrice(order.price_ugx)}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Separator />
                  <div className="space-y-4 p-4">
                    <div>
                      <h5 className="mb-3 font-medium">Order Summary</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>{order.product_name}</span>
                          <span>{order.quantity} item(s)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Artisan</span>
                          <span>{order.artisan_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Heritage contribution</span>
                          <span>{formatPrice(order.heritage_fund_ugx)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Created
                        </div>
                        <p>{format(new Date(order.created_at), 'PPP')}</p>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          Payment Method
                        </div>
                        <p className="capitalize">{order.payment_method.replace('-', ' ')}</p>
                      </div>
                    </div>

                    {(order.tracking_number || order.payment_reference) && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                          <div>
                            <span className="text-muted-foreground">Payment Ref: </span>
                            {order.payment_reference || 'Pending'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tracking: </span>
                            {order.tracking_number || 'Not assigned yet'}
                          </div>
                        </div>
                      </>
                    )}

                    {canRequestReturn && (
                      <>
                        <Separator />
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRequestReturn(order);
                            }}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
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

