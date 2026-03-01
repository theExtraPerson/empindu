
-- 1. Artisan Reviews/Ratings
CREATE TABLE public.artisan_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, artisan_id, order_id)
);

ALTER TABLE public.artisan_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.artisan_reviews FOR SELECT USING (true);
-- Buyers with delivered orders can create reviews
CREATE POLICY "Buyers can create reviews" ON public.artisan_reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id 
    AND EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = artisan_reviews.order_id 
      AND o.buyer_id = auth.uid() 
      AND o.status = 'delivered'
    )
  );
-- Users can update own reviews
CREATE POLICY "Users can update own reviews" ON public.artisan_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
-- Users can delete own reviews  
CREATE POLICY "Users can delete own reviews" ON public.artisan_reviews FOR DELETE USING (auth.uid() = reviewer_id);
-- Admins full access
CREATE POLICY "Admins manage reviews" ON public.artisan_reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Search history for recommendations
CREATE TABLE public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  search_term text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own search history" ON public.search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users insert search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Product views for recommendations
CREATE TABLE public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON public.product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own history" ON public.product_views FOR SELECT USING (auth.uid() = user_id);

-- 4. Corporate gift orders
CREATE TABLE public.corporate_gift_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  occasion text,
  budget_range text,
  delivery_date date,
  gift_message text,
  branding_notes text,
  recipient_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_gift_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift orders" ON public.corporate_gift_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create gift orders" ON public.corporate_gift_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all gift orders" ON public.corporate_gift_orders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Corporate gift order items
CREATE TABLE public.corporate_gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_order_id uuid REFERENCES public.corporate_gift_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  personalization text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_gift_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own gift items" ON public.corporate_gift_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_items.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Users create gift items" ON public.corporate_gift_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_items.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Admins manage all gift items" ON public.corporate_gift_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Corporate gift recipients
CREATE TABLE public.corporate_gift_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_order_id uuid REFERENCES public.corporate_gift_orders(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  personal_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.corporate_gift_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own recipients" ON public.corporate_gift_recipients FOR SELECT 
  USING (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_recipients.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Users create recipients" ON public.corporate_gift_recipients FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_recipients.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Users update recipients" ON public.corporate_gift_recipients FOR UPDATE
  USING (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_recipients.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Users delete recipients" ON public.corporate_gift_recipients FOR DELETE
  USING (EXISTS (SELECT 1 FROM corporate_gift_orders g WHERE g.id = corporate_gift_recipients.gift_order_id AND g.user_id = auth.uid()));
CREATE POLICY "Admins manage all recipients" ON public.corporate_gift_recipients FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
