-- Add new product detail fields
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS materials TEXT,
ADD COLUMN IF NOT EXISTS use_case TEXT,
ADD COLUMN IF NOT EXISTS is_personalizable BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS other_skills TEXT,
ADD COLUMN IF NOT EXISTS size_category TEXT CHECK (size_category IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS size_dimensions TEXT,
ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN NOT NULL DEFAULT true;

-- Create pickup_locations table for verified pickup points
CREATE TABLE IF NOT EXISTS public.pickup_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  phone TEXT,
  operating_hours TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pickup_locations
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active pickup locations
CREATE POLICY "Anyone can view active pickup locations"
ON public.pickup_locations
FOR SELECT
USING (is_active = true);

-- Admins can manage pickup locations
CREATE POLICY "Admins can manage pickup locations"
ON public.pickup_locations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add delivery method and pickup location to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_method IN ('delivery', 'pickup')),
ADD COLUMN IF NOT EXISTS pickup_location_id UUID REFERENCES public.pickup_locations(id);

-- Create personalization_requests table for custom orders
CREATE TABLE IF NOT EXISTS public.personalization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  artisan_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on personalization_requests
ALTER TABLE public.personalization_requests ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own personalization requests
CREATE POLICY "Buyers can view own personalization requests"
ON public.personalization_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = personalization_requests.order_item_id
    AND o.buyer_id = auth.uid()
  )
);

-- Buyers can create personalization requests
CREATE POLICY "Buyers can create personalization requests"
ON public.personalization_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id
    AND o.buyer_id = auth.uid()
  )
);

-- Artisans can view and update personalization requests for their products
CREATE POLICY "Artisans can view personalization requests for their products"
ON public.personalization_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.id = personalization_requests.order_item_id
    AND p.artisan_id = auth.uid()
  )
);

CREATE POLICY "Artisans can update personalization requests for their products"
ON public.personalization_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.id = personalization_requests.order_item_id
    AND p.artisan_id = auth.uid()
  )
);

-- Admins can manage all personalization requests
CREATE POLICY "Admins can manage all personalization requests"
ON public.personalization_requests
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'received', 'refunded', 'completed')),
  refund_amount DECIMAL(10, 2),
  refund_method TEXT,
  admin_notes TEXT,
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on returns
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own returns
CREATE POLICY "Buyers can view own returns"
ON public.returns
FOR SELECT
USING (auth.uid() = buyer_id);

-- Buyers can create returns for their orders
CREATE POLICY "Buyers can create returns"
ON public.returns
FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id
  AND EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id
    AND o.buyer_id = auth.uid()
  )
);

-- Admins can manage all returns
CREATE POLICY "Admins can view all returns"
ON public.returns
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all returns"
ON public.returns
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create return_items table to track which items are being returned
CREATE TABLE IF NOT EXISTS public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  condition TEXT CHECK (condition IN ('unopened', 'like_new', 'used', 'damaged')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on return_items
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own return items
CREATE POLICY "Buyers can view own return items"
ON public.return_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM returns r
    WHERE r.id = return_items.return_id
    AND r.buyer_id = auth.uid()
  )
);

-- Buyers can create return items
CREATE POLICY "Buyers can create return items"
ON public.return_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM returns r
    WHERE r.id = return_id
    AND r.buyer_id = auth.uid()
  )
);

-- Admins can manage all return items
CREATE POLICY "Admins can manage all return items"
ON public.return_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_pickup_locations_updated_at
BEFORE UPDATE ON public.pickup_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personalization_requests_updated_at
BEFORE UPDATE ON public.personalization_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_returns_updated_at
BEFORE UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default pickup locations
INSERT INTO public.pickup_locations (name, address, city, region, phone, operating_hours)
VALUES 
  ('CraftedUganda Hub - Kampala Central', 'Plot 45, Kampala Road', 'Kampala', 'Central', '+256 700 123 456', 'Mon-Sat: 9AM-6PM'),
  ('CraftedUganda Hub - Jinja', 'Main Street, Next to Jinja Market', 'Jinja', 'Eastern', '+256 700 234 567', 'Mon-Sat: 8AM-5PM'),
  ('CraftedUganda Hub - Mbarara', 'Plot 12, High Street', 'Mbarara', 'Western', '+256 700 345 678', 'Mon-Sat: 9AM-5PM'),
  ('CraftedUganda Hub - Gulu', 'Plot 8, Main Road', 'Gulu', 'Northern', '+256 700 456 789', 'Mon-Fri: 9AM-5PM');