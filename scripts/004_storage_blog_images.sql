-- Create Storage Bucket and Policies for Blog Images
-- Run this in Supabase SQL Editor after 003_complete_setup.sql
-- Bucket name must match frontend: "blog-images"

-- ============================================================================
-- STEP 1: Create the blog-images bucket (public for read-only access to images)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STEP 2: Storage policies on storage.objects
-- ============================================================================
-- Drop existing policies for this bucket to avoid duplicates
DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_delete" ON storage.objects;

-- SELECT: Public can read all objects in blog-images (for displaying post images)
CREATE POLICY "blog_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- INSERT: Only admins can upload (authenticated + in admin_profiles with role admin/super_admin)
CREATE POLICY "blog_images_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.id = auth.uid() AND ap.role IN ('admin', 'super_admin')
  )
);

-- UPDATE: Only admins can update/overwrite
CREATE POLICY "blog_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.id = auth.uid() AND ap.role IN ('admin', 'super_admin')
  )
);

-- DELETE: Only admins can delete objects
CREATE POLICY "blog_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.id = auth.uid() AND ap.role IN ('admin', 'super_admin')
  )
);
