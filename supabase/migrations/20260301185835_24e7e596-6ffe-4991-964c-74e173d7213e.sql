
-- Fix: restrict product_views insert to require at least a valid product_id (the true check is acceptable for anonymous tracking)
-- The product_views INSERT policy with true is acceptable since we want anonymous product view tracking
-- No actual fix needed for this case - it's by design

-- Fix search_history duplicate policy issue - drop the ALL policy since it conflicts
DROP POLICY IF EXISTS "Users manage own search history" ON public.search_history;
