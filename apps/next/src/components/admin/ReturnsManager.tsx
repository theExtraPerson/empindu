import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Search, Eye, CheckCircle, XCircle, Truck, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ReturnItem {
  id: string;
  quantity: number;
  reason: string;
  order_item: {
    product: {
      name: string;
    };
  };
}

interface Return {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  refund_amount: number | null;
  refund_method: string | null;
  created_at: string;
  order: {
    id: string;
    total_amount: number;
  };
  buyer: {
    full_name: string;
    phone: string;
  };
  return_items: ReturnItem[];
}

const STATUS_OPTIONS = [
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'received', label: 'Received' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'rejected', label: 'Rejected' }
];

const statusColors: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  pickup_scheduled: 'bg-purple-100 text-purple-800',
  received: 'bg-indigo-100 text-indigo-800',
  refunded: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

export const ReturnsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const { data: returns, isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders (id, total_amount),
          return_items (
            id,
            quantity,
            reason,
            order_item:order_items (
              product:products (name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch buyer profiles separately
      const buyerIds = [...new Set(data?.map(r => r.buyer_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone')
        .in('user_id', buyerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data?.map(r => ({
        ...r,
        buyer: profileMap.get(r.buyer_id) || { full_name: 'Unknown', phone: '' }
      })) as Return[];
    }
  });

  const updateReturnMutation = useMutation({
    mutationFn: async ({ returnId, updates }: { returnId: string; updates: any }) => {
      const { error } = await supabase
        .from('returns')
        .update(updates)
        .eq('id', returnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      toast({ title: 'Return Updated', description: 'Return status has been updated.' });
      setDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleUpdateStatus = (returnId: string, status: string) => {
    const updates: any = { status };
    
    if (status === 'received') {
      updates.received_at = new Date().toISOString();
    } else if (status === 'refunded') {
      updates.refunded_at = new Date().toISOString();
    }

    updateReturnMutation.mutate({ returnId, updates });
  };

  const handleSaveDetails = () => {
    if (!selectedReturn) return;

    const updates: any = {
      admin_notes: adminNotes || null
    };

    if (refundAmount) {
      updates.refund_amount = parseFloat(refundAmount);
    }

    updateReturnMutation.mutate({ returnId: selectedReturn.id, updates });
  };

  const openDetails = (ret: Return) => {
    setSelectedReturn(ret);
    setAdminNotes(ret.admin_notes || '');
    setRefundAmount(ret.refund_amount?.toString() || '');
    setDetailsOpen(true);
  };

  const filteredReturns = returns?.filter(ret => {
    const matchesSearch = 
      ret.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ret.order?.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search returns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Returns Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Return ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns?.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell className="font-mono text-sm">
                  #{ret.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{ret.buyer?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{ret.buyer?.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  #{ret.order?.id.slice(0, 8)}
                </TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {ret.reason}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[ret.status] || 'bg-gray-100'}>
                    {ret.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(ret.created_at), 'PP')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetails(ret)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {ret.status === 'requested' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleUpdateStatus(ret.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleUpdateStatus(ret.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredReturns?.length === 0 && (
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No returns found</p>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Return ID:</span>
                  <p className="font-mono">#{selectedReturn.id.slice(0, 8)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Order ID:</span>
                  <p className="font-mono">#{selectedReturn.order?.id.slice(0, 8)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p>{selectedReturn.buyer?.full_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p>{selectedReturn.buyer?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Items to Return</h4>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {selectedReturn.return_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.order_item?.product?.name}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason & Description */}
              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm">{selectedReturn.reason}</p>
                {selectedReturn.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedReturn.description}</p>
                )}
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select
                  value={selectedReturn.status}
                  onValueChange={(value) => handleUpdateStatus(selectedReturn.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refund Amount */}
              <div className="space-y-2">
                <Label htmlFor="refundAmount">Refund Amount (UGX)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter refund amount"
                />
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this return..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveDetails}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
