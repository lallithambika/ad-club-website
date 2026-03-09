-- Storage Bucket Setup for Blog Images
-- Note: Bucket creation via SQL is not supported in Supabase
-- You must create the bucket manually or via dashboard:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create new bucket named "blog-images"
-- 3. Make it PUBLIC (uncheck "Private bucket")
-- 4. Enable row-level security

-- However, we can set up the storage policies once the bucket exists
-- This script documents the required bucket configuration

-- Storage bucket policies (run these after creating the bucket via dashboard)
-- For blog-images bucket:
-- - Allow public to read (GET)
-- - Allow authenticated admins to upload (POST)
-- - Allow authenticated admins to update (PUT)
-- - Allow authenticated admins to delete (DELETE)

-- Example bucket creation via Supabase dashboard:
-- CREATE BUCKET blog-images;
-- ALTER BUCKET blog-images ENABLE ROW LEVEL SECURITY;

-- Storage policies for blog-images:
-- DROP POLICY IF EXISTS "public_read_blog_images" ON storage.objects;
-- CREATE POLICY "public_read_blog_images"
--     ON storage.objects
--     FOR SELECT
--     USING (bucket_id = 'blog-images');

-- DROP POLICY IF EXISTS "admin_upload_blog_images" ON storage.objects;
-- CREATE POLICY "admin_upload_blog_images"
--     ON storage.objects
--     FOR INSERT
--     USING (bucket_id = 'blog-images' AND EXISTS (
--         SELECT 1 FROM public.admin_profiles
--         WHERE admin_profiles.id = auth.uid()
--         AND admin_profiles.role IN ('admin', 'super_admin')
--     ))
--     WITH CHECK (bucket_id = 'blog-images' AND EXISTS (
--         SELECT 1 FROM public.admin_profiles
--         WHERE admin_profiles.id = auth.uid()
--         AND admin_profiles.role IN ('admin', 'super_admin')
--     ));

-- DROP POLICY IF EXISTS "admin_delete_blog_images" ON storage.objects;
-- CREATE POLICY "admin_delete_blog_images"
--     ON storage.objects
--     FOR DELETE
--     USING (bucket_id = 'blog-images' AND EXISTS (
--         SELECT 1 FROM public.admin_profiles
--         WHERE admin_profiles.id = auth.uid()
--         AND admin_profiles.role IN ('admin', 'super_admin')
--     ));
