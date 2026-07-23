
DROP POLICY IF EXISTS "Public can view verified business profiles" ON public.business_profiles;

CREATE OR REPLACE VIEW public.public_business_profiles
WITH (security_invoker = true) AS
SELECT id, user_id, business_name, business_type, description,
       business_address, business_city, business_country,
       is_verified, created_at, updated_at
FROM public.business_profiles
WHERE is_verified = true;

GRANT SELECT ON public.public_business_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view likes" ON public.artisan_likes;

CREATE POLICY "Users can view their own likes"
ON public.artisan_likes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.artisan_like_counts
WITH (security_invoker = true) AS
SELECT artisan_id, COUNT(*)::bigint AS like_count
FROM public.artisan_likes
GROUP BY artisan_id;

GRANT SELECT ON public.artisan_like_counts TO anon, authenticated;

DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
CREATE POLICY "Service role can insert payments"
ON public.payments FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert views" ON public.product_views;
CREATE POLICY "Users can insert their own views"
ON public.product_views FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_artisan_for_order(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
