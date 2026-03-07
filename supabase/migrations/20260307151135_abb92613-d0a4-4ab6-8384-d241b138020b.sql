
-- Status history table for corporate gift orders
CREATE TABLE public.gift_order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_order_id UUID NOT NULL REFERENCES public.corporate_gift_orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gift_order_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage status history"
  ON public.gift_order_status_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view history for their own gift orders
CREATE POLICY "Users view own order history"
  ON public.gift_order_status_history FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.corporate_gift_orders g
    WHERE g.id = gift_order_status_history.gift_order_id AND g.user_id = auth.uid()
  ));

-- Users can insert history for their own orders (for initial creation)
CREATE POLICY "Users insert own order history"
  ON public.gift_order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.corporate_gift_orders g
    WHERE g.id = gift_order_status_history.gift_order_id AND g.user_id = auth.uid()
  ));

-- Also add SELECT policy for search_history so recommendations hook works
CREATE POLICY "Users select search history"
  ON public.search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
