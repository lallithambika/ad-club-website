-- Fix infinite recursion in admin_profiles RLS policies
-- This script drops all existing policies and recreates them with non-recursive logic

-- Drop all existing policies on admin_profiles
DROP POLICY IF EXISTS "admin_profiles_select" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_any" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_self" ON public.admin_profiles;

-- Create simple, non-recursive RLS policies for admin_profiles
-- These policies ONLY use auth.uid() and NEVER query admin_profiles table

-- SELECT: Users can only read their own admin profile
CREATE POLICY "admin_profiles_select_own" ON public.admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- INSERT: Users can only insert their own admin profile (for first-time Google login)
CREATE POLICY "admin_profiles_insert_own" ON public.admin_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own admin profile
CREATE POLICY "admin_profiles_update_own" ON public.admin_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: DELETE is not needed for admin_profiles (cascade delete from auth.users handles it)
