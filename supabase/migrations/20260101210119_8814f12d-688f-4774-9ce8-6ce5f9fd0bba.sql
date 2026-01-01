-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view available products"
ON public.products FOR SELECT
USING (is_available = true);

CREATE POLICY "Artisans can view own products"
ON public.products FOR SELECT
USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can create products"
ON public.products FOR INSERT
WITH CHECK (
  auth.uid() = artisan_id AND 
  public.has_role(auth.uid(), 'artisan')
);

CREATE POLICY "Artisans can update own products"
ON public.products FOR UPDATE
USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can delete own products"
ON public.products FOR DELETE
USING (auth.uid() = artisan_id);

-- Product images policies
CREATE POLICY "Anyone can view product images"
ON public.product_images FOR SELECT
USING (true);

CREATE POLICY "Artisans can manage own product images"
ON public.product_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND artisan_id = auth.uid()
  )
);

CREATE POLICY "Artisans can update own product images"
ON public.product_images FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND artisan_id = auth.uid()
  )
);

CREATE POLICY "Artisans can delete own product images"
ON public.product_images FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND artisan_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Artisans can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND 
  public.has_role(auth.uid(), 'artisan')
);

CREATE POLICY "Artisans can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Artisans can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);