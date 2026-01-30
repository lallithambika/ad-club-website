# AD Club Website - Setup Guide

## Quick Start

### 1. Database Setup (Supabase)

**IMPORTANT:** Run these SQL scripts in your Supabase SQL Editor in this order:

1. **First, run `scripts/003_complete_setup.sql`** (or `scripts/001_create_admin_tables.sql` if you need all tables)
   - This creates all necessary tables including `blog_posts`, `blog_comments`, `blog_likes`, and `admin_profiles`
   - Sets up proper RLS policies to prevent infinite recursion errors

2. **If you see RLS recursion errors**, also run `scripts/002_fix_admin_profiles_rls.sql`
   - This fixes the `admin_profiles` RLS policies that cause infinite recursion

### 2. Storage Setup (Supabase)

**Option A (recommended):** Run the SQL script to create the bucket and policies:

1. In Supabase SQL Editor, run **`scripts/004_storage_blog_images.sql`**
   - Creates the `blog-images` bucket (public, 5MB limit, images only)
   - Sets RLS so the public can read images and only admins can upload/update/delete

**Option B (manual):** Create the bucket in the Dashboard:

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. Name it: `blog-images`
4. Make it **Public**
5. Then run `scripts/004_storage_blog_images.sql` to add the storage policies (DROP/CREATE policies only; bucket must exist)

### 3. Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies & Run

```bash
pnpm install
pnpm dev
```

## Common Issues & Solutions

### Issue: "Failed to load blog posts {}" or "relation blog_posts does not exist"

**Solution:** Run `scripts/003_complete_setup.sql` in Supabase SQL Editor.

### Issue: "infinite recursion detected in policy for relation admin_profiles"

**Solution:** Run `scripts/002_fix_admin_profiles_rls.sql` in Supabase SQL Editor.

### Issue: "Redirecting..." loop on `/admin`

**Solution:** 
1. Check browser console for errors
2. Ensure `admin_profiles` table exists and RLS policies are correct
3. Try logging out and logging back in
4. Clear browser cookies/localStorage

### Issue: "Bucket blog-images not found" when uploading images

**Solution:** Create the `blog-images` storage bucket in Supabase (see Storage Setup above).

### Issue: "Permission denied" errors

**Solution:** 
1. Check RLS policies in Supabase
2. Ensure your user has an `admin_profiles` row with `role = 'admin'` or `'super_admin'`
3. Verify Storage bucket policies allow uploads

## Features

### Admin Features (`/admin`)
- **Dashboard**: Overview of events, projects, team members
- **Blog**: Create Instagram-style posts with images, captions, hashtags
- **Events**: Manage club events
- **Projects**: Manage club projects
- **Team**: Manage team members
- **Announcements**: Create announcements
- **Messages**: View contact form submissions
- **Settings**: Configure club settings

### Public Features
- **Home**: Landing page
- **Blog** (`/blog`): Instagram-style feed with likes, comments, share
- **Events**: View upcoming events
- **Projects**: Browse club projects
- **Team**: See team members
- **Contact**: Contact form

## Database Schema

### Key Tables

- `admin_profiles`: Admin user profiles (linked to `auth.users`)
- `blog_posts`: Blog posts with images, captions, tags
- `blog_comments`: Comments on blog posts (no login required)
- `blog_likes`: Likes on blog posts (anonymous via localStorage)
- `events`: Club events
- `projects`: Club projects
- `team_members`: Team member profiles
- `contact_messages`: Contact form submissions
- `settings`: Club settings (single row)

## Authentication

- Admins log in via Google OAuth (`/admin/login`)
- First-time login automatically creates an `admin_profiles` row with `role = 'admin'`
- Public users don't need to log in (anonymous likes/comments)

## Troubleshooting

### Check Database Tables Exist

Run in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('blog_posts', 'blog_comments', 'blog_likes', 'admin_profiles');
```

### Check RLS Policies

Run in Supabase SQL Editor:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('blog_posts', 'admin_profiles');
```

### Verify Admin Profile

Run in Supabase SQL Editor (replace `YOUR_USER_ID`):
```sql
SELECT * FROM admin_profiles WHERE id = 'YOUR_USER_ID';
```

## Need Help?

1. Check browser console for detailed error messages
2. Check Supabase logs in the Dashboard
3. Verify all SQL scripts have been run successfully
4. Ensure Storage bucket exists and is accessible
