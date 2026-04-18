'use client';

import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createReturnRequest, type Order } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSuccess: () => void;
}

const RETURN_REASONS = [
  { value: 'damaged', label: 'Product arrived damaged' },
  { value: 'not_as_described', label: 'Product not as described' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'late_delivery', label: 'Delivery took too long' },
  { value: 'other', label: 'Other reason' },
];

export const ReturnRequestDialog = ({ open, onOpenChange, order, onSuccess }: ReturnRequestDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = async () => {
    if (!order) return;

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please select a reason for the return request.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createReturnRequest(order.id, {
        reason,
        details,
        refund_amount_ugx: order.price_ugx,
      });

      toast({
        title: 'Return Request Submitted',
        description: 'We have logged your return request for review.',
      });

      setReason('');
      setDetails('');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit return request.';
      toast({
        title: 'Request Failed',
        description: message,
        variant: 'destructive',
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
            Submit a return request for Order #{String(order.id).padStart(5, '0')}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">{order.product_name}</p>
            <p className="text-muted-foreground">Quantity: {order.quantity}</p>
            <p className="text-muted-foreground">Order value: UGX {order.price_ugx.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Return *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Tell us what happened so the operations team can review quickly."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
