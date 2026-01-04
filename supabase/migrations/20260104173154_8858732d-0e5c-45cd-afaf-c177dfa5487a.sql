-- Add RLS policy for artisans to view orders containing their products
CREATE POLICY "Artisans can view orders with their products"
ON public.orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = orders.id
      AND p.artisan_id = auth.uid()
  )
);

-- Add RLS policy for artisans to view order items for their products
CREATE POLICY "Artisans can view order items for their products"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
      AND products.artisan_id = auth.uid()
  )
);