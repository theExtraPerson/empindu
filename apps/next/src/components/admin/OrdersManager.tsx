import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Package } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string | null;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products: { name: string; category: string } | null;
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const OrdersManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ['order-items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name, category)')
        .eq('order_id', selectedOrder.id);
      
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!selectedOrder,
  });

  const { data: buyerProfiles = {} } = useQuery({
    queryKey: ['buyer-profiles', orders.map(o => o.buyer_id)],
    queryFn: async () => {
      const buyerIds = [...new Set(orders.map(o => o.buyer_id))];
      if (buyerIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', buyerIds);
      
      if (error) throw error;
      return Object.fromEntries((data || []).map(p => [p.user_id, p]));
    },
    enabled: orders.length > 0,
  });

  const { data: buyerEmails = {} } = useQuery({
    queryKey: ['buyer-emails'],
    queryFn: async () => {
      // We'll store emails from orders shipping info if available
      const emailMap: Record<string, string> = {};
      orders.forEach(o => {
        // Since we don't have direct access to auth.users, we'll need to send email via buyer_id lookup
        // For now, we'll use the profiles which may have contact info
      });
      return emailMap;
    },
    enabled: orders.length > 0,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, order }: { orderId: string; status: OrderStatus; order: Order }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;

      // Send status update email
      const buyerProfile = buyerProfiles[order.buyer_id];
      if (buyerProfile) {
        try {
          await supabase.functions.invoke('send-order-email', {
            body: {
              type: status === 'shipped' ? 'shipped' : 'status_update',
              email: 'customer@example.com', // In production, get from user profile or order
              customerName: buyerProfile.full_name || 'Customer',
              orderId: orderId,
              newStatus: status,
              shippingAddress: `${order.shipping_address}<br>${order.shipping_city}, ${order.shipping_country}`
            }
          });
        } catch (emailError) {
          console.error('Failed to send status email:', emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {buyerProfiles[order.buyer_id]?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => 
                            updateStatusMutation.mutate({ orderId: order.id, status: value as OrderStatus, order })
                          }
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(status => (
                              <SelectItem key={status} value={status} className="capitalize">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Order ID</p>
                                  <p className="font-mono">{order.id}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Status</p>
                                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p>{format(new Date(order.created_at), 'PPpp')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Payment Method</p>
                                  <p className="capitalize">{order.payment_method}</p>
                                </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground mb-2">Shipping Address</p>
                                <p>{order.shipping_address}</p>
                                <p>{order.shipping_city}, {order.shipping_country} {order.shipping_postal_code}</p>
                              </div>

                              {order.notes && (
                                <div className="border-t pt-4">
                                  <p className="text-muted-foreground mb-2">Notes</p>
                                  <p>{order.notes}</p>
                                </div>
                              )}

                              <div className="border-t pt-4">
                                <p className="text-muted-foreground mb-2">Items</p>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Product</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead>Price</TableHead>
                                      <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {orderItems.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.products?.name || 'Unknown'}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${Number(item.unit_price).toFixed(2)}</TableCell>
                                        <TableCell>${(item.quantity * Number(item.unit_price)).toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              <div className="border-t pt-4 text-right">
                                <p className="text-lg font-semibold">
                                  Total: ${Number(order.total_amount).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
