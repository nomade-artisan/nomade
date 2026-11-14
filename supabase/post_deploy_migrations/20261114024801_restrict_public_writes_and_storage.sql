-- Keep public catalog reads available while removing direct anonymous writes.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.collections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_images;
DROP POLICY IF EXISTS "sup" ON public.product_images;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;

-- Analytics and contact data must only be written/read by trusted server code.
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.analytics_events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.analytics_events;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product_daily_metrics;
DROP POLICY IF EXISTS "Insertion publique des contacts" ON public.contacts;

REVOKE ALL ON TABLE public.products, public.categories, public.collections,
  public.product_images, public.reviews
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.products, public.categories, public.collections,
  public.product_images, public.reviews
  TO anon, authenticated;

REVOKE ALL ON TABLE public.analytics_events, public.product_daily_metrics,
  public.contacts
  FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Public reads active products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Enable read access for all users" ON public.product_images;
CREATE POLICY "Public images for active products"
  ON public.product_images FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products AS product
      WHERE product.id = product_images.product_id
        AND product.status = 'active'
    )
  );

-- Admin uploads use the service role. Browsers cannot upload directly to Storage.
DROP POLICY IF EXISTS "Upload pour tous" ON storage.objects;
REVOKE INSERT, UPDATE, DELETE ON TABLE storage.objects FROM PUBLIC, anon, authenticated;

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
WHERE id = 'products';

UPDATE storage.buckets
SET file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/webp', 'video/mp4', 'video/webm']::text[]
WHERE id = 'collections';

-- Do not expose helper functions that change RLS, and pin trigger search_path.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.promo_codes_set_updated_at() SET search_path = public, pg_temp;

-- Keep the unique index used by metric upserts and remove its redundant copy.
DROP INDEX IF EXISTS public.idx_product_daily_metrics_unique;
