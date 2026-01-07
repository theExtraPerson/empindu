import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  order_items: OrderItem[];
}

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  { value: 'defective', label: 'Product is defective or damaged' },
  { value: 'not_as_described', label: 'Product not as described' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'quality', label: 'Quality not satisfactory' },
  { value: 'other', label: 'Other reason' }
];

export const ReturnRequestDialog = ({ open, onOpenChange, order, onSuccess }: ReturnRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, { selected: boolean; quantity: number }>>({});

  const returnableItems = order?.order_items.filter(item => item.product.is_returnable) || [];

  const handleItemToggle = (itemId: string, checked: boolean) => {
    const item = returnableItems.find(i => i.id === itemId);
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { 
        selected: checked, 
        quantity: checked ? (item?.quantity || 1) : 0 
      }
    }));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity }
    }));
  };

  const handleSubmit = async () => {
    if (!user || !order) return;

    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, value]) => value.selected && value.quantity > 0);

    if (itemsToReturn.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to return.',
        variant: 'destructive'
      });
      return;
    }

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for the return.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Create return request
      const { data: returnRequest, error: returnError } = await supabase
        .from('returns')
        .insert({
          order_id: order.id,
          buyer_id: user.id,
          reason: reason,
          description: description || null,
          status: 'requested'
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Create return items
      const returnItems = itemsToReturn.map(([itemId, value]) => ({
        return_id: returnRequest.id,
        order_item_id: itemId,
        quantity: value.quantity,
        reason: reason
      }));

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Return Request Submitted',
        description: 'We will review your request and get back to you shortly.'
      });

      // Reset form
      setReason('');
      setDescription('');
      setSelectedItems({});
      onSuccess();
    } catch (error: any) {
      console.error('Return request error:', error);
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to submit return request.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Request Return
          </DialogTitle>
          <DialogDescription>
            Select the items you wish to return from Order #{order.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Items Selection */}
          <div className="space-y-3">
            <Label>Select Items to Return</Label>
            {returnableItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No returnable items in this order.</p>
            ) : (
              <div className="space-y-3">
                {returnableItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={item.id}
                        checked={selectedItems[item.id]?.selected || false}
                        onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                      />
                      <label htmlFor={item.id} className="text-sm cursor-pointer">
                        {item.product.name}
                      </label>
                    </div>
                    {selectedItems[item.id]?.selected && (
                      <Select
                        value={String(selectedItems[item.id]?.quantity || 1)}
                        onValueChange={(v) => handleQuantityChange(item.id, parseInt(v))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: item.quantity }, (_, i) => i + 1).map((qty) => (
                            <SelectItem key={qty} value={String(qty)}>
                              {qty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional details about your return request..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || returnableItems.length === 0}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Return Request'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
