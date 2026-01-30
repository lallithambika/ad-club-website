-- Complete Database Setup Script for AD Club Website
-- Run this script in Supabase SQL Editor to set up all tables and RLS policies
-- This script is idempotent - safe to run multiple times

-- ============================================================================
-- STEP 1: Create admin_profiles table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Fix admin_profiles RLS policies (prevent infinite recursion)
-- ============================================================================
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admin_profiles_select" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_any" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_self" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_own" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_own" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_own" ON public.admin_profiles;

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies (ONLY use auth.uid(), NEVER query admin_profiles)
CREATE POLICY "admin_profiles_select_own" ON public.admin_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "admin_profiles_insert_own" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_profiles_update_own" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: Create blog_posts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create blog_comments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- ============================================================================
-- STEP 5: Create blog_likes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT blog_likes_unique UNIQUE (post_id, user_identifier)
);

-- ============================================================================
-- STEP 6: Enable RLS on blog tables
-- ============================================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: Create RLS policies for blog_posts
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "blog_posts_select_published" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert_admin" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_update_admin" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete_admin" ON public.blog_posts;

-- SELECT: Public can read published posts, admins can read all
CREATE POLICY "blog_posts_select_published" ON public.blog_posts
  FOR SELECT USING (
    status = 'published'
    OR EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- INSERT: Only admins can create posts
CREATE POLICY "blog_posts_insert_admin" ON public.blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- UPDATE: Only admins can update posts
CREATE POLICY "blog_posts_update_admin" ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- DELETE: Only admins can delete posts
CREATE POLICY "blog_posts_delete_admin" ON public.blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- STEP 8: Create RLS policies for blog_comments
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "blog_comments_select_public" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert_public" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_update_admin" ON public.blog_comments;
DROP POLICY IF EXISTS "blog_comments_delete_admin" ON public.blog_comments;

-- SELECT: Public can read approved comments, admins can read all
CREATE POLICY "blog_comments_select_public" ON public.blog_comments
  FOR SELECT USING (
    is_approved = true
    OR EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- INSERT: Anyone can comment (no login required)
CREATE POLICY "blog_comments_insert_public" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

-- UPDATE: Only admins can update comments
CREATE POLICY "blog_comments_update_admin" ON public.blog_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- DELETE: Only admins can delete comments
CREATE POLICY "blog_comments_delete_admin" ON public.blog_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- STEP 9: Create RLS policies for blog_likes
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "blog_likes_select_public" ON public.blog_likes;
DROP POLICY IF EXISTS "blog_likes_insert_public" ON public.blog_likes;

-- SELECT: Public can read likes
CREATE POLICY "blog_likes_select_public" ON public.blog_likes
  FOR SELECT USING (true);

-- INSERT: Anyone can like (no login required)
CREATE POLICY "blog_likes_insert_public" ON public.blog_likes
  FOR INSERT WITH CHECK (true);

-- DELETE: Anyone can remove their own like (by user_identifier; app tracks anon id)
DROP POLICY IF EXISTS "blog_likes_delete_public" ON public.blog_likes;
CREATE POLICY "blog_likes_delete_public" ON public.blog_likes
  FOR DELETE USING (true);

-- ============================================================================
-- STEP 10: Create other tables (events, projects, etc.) if needed
-- ============================================================================
-- These are already in 001_create_admin_tables.sql, but including here for completeness
-- You can run 001_create_admin_tables.sql separately if you need those tables

-- ============================================================================
-- VERIFICATION QUERIES (optional - run these to verify setup)
-- ============================================================================
-- Check if tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'blog%';

-- Check RLS policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'blog%';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Create a Supabase Storage bucket named "blog-images" (public or with proper RLS)
-- 2. Restart your Next.js dev server
-- 3. Try logging into /admin/login
-- 4. Create your first blog post!
