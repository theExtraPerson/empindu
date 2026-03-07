import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Truck, Package, Eye, XCircle, Sparkles, Circle } from 'lucide-react';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
  reviewed: { icon: Eye, color: 'text-blue-600', label: 'Reviewed' },
  confirmed: { icon: CheckCircle2, color: 'text-indigo-600', label: 'Confirmed' },
  in_production: { icon: Sparkles, color: 'text-purple-600', label: 'In Production' },
  shipped: { icon: Truck, color: 'text-cyan-600', label: 'Shipped' },
  delivered: { icon: Package, color: 'text-green-600', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', label: 'Cancelled' },
};

interface Props {
  giftOrderId: string;
}

export const GiftOrderTimeline = ({ giftOrderId }: Props) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['gift-order-history', giftOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_order_status_history')
        .select('*')
        .eq('gift_order_id', giftOrderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading timeline...</p>;

  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status history yet.</p>;
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

      <div className="space-y-4">
        {history.map((entry, idx) => {
          const config = statusConfig[entry.new_status] || { icon: Circle, color: 'text-muted-foreground', label: entry.new_status };
          const Icon = config.icon;
          const isLatest = idx === history.length - 1;

          return (
            <div key={entry.id} className="relative flex items-start gap-3">
              {/* Dot */}
              <div className={`absolute -left-6 mt-0.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                isLatest ? 'bg-primary border-primary' : 'bg-background border-border'
              }`}>
                <Icon className={`h-3 w-3 ${isLatest ? 'text-primary-foreground' : config.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold capitalize ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {config.label}
                  </span>
                  {entry.old_status && (
                    <span className="text-xs text-muted-foreground">
                      from {statusConfig[entry.old_status]?.label || entry.old_status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
                </p>
                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{entry.note}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
