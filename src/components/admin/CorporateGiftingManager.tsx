import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Eye, Gift, Users, Package } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const GIFT_STATUSES = ['pending', 'reviewed', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800',
  in_production: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const CorporateGiftingManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: giftOrders = [], isLoading } = useQuery({
    queryKey: ['admin-gift-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_gift_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: giftItems = [] } = useQuery({
    queryKey: ['gift-items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from('corporate_gift_items')
        .select('*, products:product_id(name, category)')
        .eq('gift_order_id', selectedOrder.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder,
  });

  const { data: giftRecipients = [] } = useQuery({
    queryKey: ['gift-recipients', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const { data, error } = await supabase
        .from('corporate_gift_recipients')
        .select('*')
        .eq('gift_order_id', selectedOrder.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const update: any = { status };
      if (notes !== undefined) update.notes = notes;
      const { error } = await supabase
        .from('corporate_gift_orders')
        .update(update)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gift-orders'] });
      toast.success('Gift order updated');
    },
    onError: () => toast.error('Failed to update gift order'),
  });

  const filteredOrders = giftOrders.filter(order => {
    const matchesSearch =
      order.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = giftItems.reduce((sum, item) => sum + item.quantity * Number(item.unit_price), 0);

  if (isLoading) return <div className="text-center py-8">Loading gift orders...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Corporate Gift Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, contact, or ID..."
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
              {GIFT_STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No corporate gift orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.company_name}</TableCell>
                    <TableCell>
                      <div>{order.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{order.contact_email}</div>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{order.recipient_count}</TableCell>
                    <TableCell className="capitalize">{order.occasion || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || 'bg-muted text-muted-foreground'}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateMutation.mutate({ id: order.id, status: value })}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GIFT_STATUSES.map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedOrder(order);
                              setAdminNotes(order.notes || '');
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Corporate Gift Order Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5">
                              {/* Company Info */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Company</p>
                                  <p className="font-medium">{order.company_name}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Contact</p>
                                  <p>{order.contact_name}</p>
                                  <p className="text-xs text-muted-foreground">{order.contact_email}</p>
                                  {order.contact_phone && <p className="text-xs text-muted-foreground">{order.contact_phone}</p>}
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Occasion</p>
                                  <p className="capitalize">{order.occasion || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Budget Range</p>
                                  <p>{order.budget_range || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Delivery Date</p>
                                  <p>{order.delivery_date ? format(new Date(order.delivery_date), 'PPP') : '—'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Status</p>
                                  <Badge className={statusColors[order.status] || ''}>{order.status.replace('_', ' ')}</Badge>
                                </div>
                              </div>

                              {order.gift_message && (
                                <div className="border-t pt-4">
                                  <p className="text-muted-foreground text-sm mb-1">Gift Message</p>
                                  <p className="text-sm italic">"{order.gift_message}"</p>
                                </div>
                              )}

                              {order.branding_notes && (
                                <div className="border-t pt-4">
                                  <p className="text-muted-foreground text-sm mb-1">Branding Notes</p>
                                  <p className="text-sm">{order.branding_notes}</p>
                                </div>
                              )}

                              {/* Items */}
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                                  <Package className="h-4 w-4" /> Gift Items
                                </p>
                                {giftItems.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Personalization</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {giftItems.map((item: any) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{(item.products as any)?.name || 'Unknown'}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>UGX {Number(item.unit_price).toLocaleString()}</TableCell>
                                          <TableCell className="text-sm">{item.personalization || '—'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No items</p>
                                )}
                                {giftItems.length > 0 && (
                                  <p className="text-right font-semibold mt-2">
                                    Estimated Total: UGX {totalValue.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              {/* Recipients */}
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                                  <Users className="h-4 w-4" /> Recipients ({giftRecipients.length})
                                </p>
                                {giftRecipients.length > 0 ? (
                                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                                    {giftRecipients.map((r: any) => (
                                      <div key={r.id} className="text-sm border rounded p-2">
                                        <p className="font-medium">{r.name}</p>
                                        {r.email && <p className="text-muted-foreground">{r.email}</p>}
                                        {r.phone && <p className="text-muted-foreground">{r.phone}</p>}
                                        {r.address && <p className="text-muted-foreground">{r.address}, {r.city}</p>}
                                        {r.personal_message && <p className="italic text-xs mt-1">"{r.personal_message}"</p>}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No recipients listed</p>
                                )}
                              </div>

                              {/* Admin Notes */}
                              <div className="border-t pt-4">
                                <p className="text-muted-foreground text-sm mb-2">Admin Notes</p>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add internal notes about this order..."
                                  rows={3}
                                />
                                <Button
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => updateMutation.mutate({ id: order.id, status: order.status, notes: adminNotes })}
                                >
                                  Save Notes
                                </Button>
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
