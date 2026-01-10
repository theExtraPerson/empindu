-- Drop the problematic policy
DROP POLICY IF EXISTS "Artisans can view orders with their products" ON public.orders;

-- Create a security definer function to check if user is artisan for an order
CREATE OR REPLACE FUNCTION public.is_artisan_for_order(order_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = order_uuid
      AND p.artisan_id = auth.uid()
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Artisans can view orders with their products" 
ON public.orders 
FOR SELECT 
USING (public.is_artisan_for_order(id));