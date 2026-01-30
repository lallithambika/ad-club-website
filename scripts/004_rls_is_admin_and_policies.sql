-- ============================================================================
-- RLS helper: is_admin() SECURITY DEFINER
-- Use this in policies to avoid "permission denied for table users" when
-- policy evaluation reads admin_profiles (which references auth.users).
-- Run this in Supabase SQL Editor after 001_create_admin_tables.sql.
-- ============================================================================

-- Drop existing function if re-running
DROP FUNCTION IF EXISTS public.is_admin();

-- Returns true iff current user has a row in admin_profiles with role in ('admin','super_admin').
-- SECURITY DEFINER runs with owner rights so it can read admin_profiles without RLS blocking.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.id = auth.uid()
      AND ap.role IN ('admin', 'super_admin')
  );
$$;

-- Grant execute to authenticated and anon (RLS still applies to tables; this is just the helper)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================================================
-- Optional: replace inline admin checks with is_admin() for consistency.
-- Uncomment and run if you want policies to use the helper (fewer permission issues).
-- ============================================================================

-- Events: drop and recreate using is_admin()
-- DROP POLICY IF EXISTS "events_insert_admin" ON public.events;
-- DROP POLICY IF EXISTS "events_update_admin" ON public.events;
-- DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
-- CREATE POLICY "events_insert_admin" ON public.events FOR INSERT WITH CHECK (public.is_admin());
-- CREATE POLICY "events_update_admin" ON public.events FOR UPDATE USING (public.is_admin());
-- CREATE POLICY "events_delete_admin" ON public.events FOR DELETE USING (public.is_admin());

-- Repeat for projects, team_members, announcements, contact_messages, settings, blog_* as needed.
-- Keeping existing policies is fine; is_admin() is here for future use or if you hit permission errors.
