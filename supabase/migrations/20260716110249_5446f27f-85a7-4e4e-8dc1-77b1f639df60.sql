
DROP POLICY IF EXISTS "Artisans can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Artisans can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Artisans can delete own product images" ON storage.objects;

CREATE POLICY "Artisans can upload own product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'artisan'::app_role)
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.artisan_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Artisans can update own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.artisan_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[2]
  )
)
WITH CHECK (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.artisan_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[2]
  )
);

CREATE POLICY "Artisans can delete own product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.artisan_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[2]
  )
);
