# AD Club Website - Database Setup Guide

## Quick Setup

To set up the database for the AD Club website, follow these steps:

### 1. Go to Supabase Dashboard

1. Open your Supabase project at https://app.supabase.com
2. Navigate to the **SQL Editor** section

### 2. Create Tables

Copy and paste the following SQL into the SQL Editor and execute it:

```sql
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS blog_posts_created_idx ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_likes_post_idx ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS blog_comments_post_idx ON public.blog_comments(post_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Public can read published posts
DROP POLICY IF EXISTS "public_read_published" ON public.blog_posts;
CREATE POLICY "public_read_published"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Create RLS policy: Anyone can like posts
DROP POLICY IF EXISTS "public_like_posts" ON public.blog_likes;
CREATE POLICY "public_like_posts"
  ON public.blog_likes
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_likes" ON public.blog_likes;
CREATE POLICY "public_read_likes"
  ON public.blog_likes
  FOR SELECT
  USING (true);

-- Create RLS policy: Anyone can comment on posts
DROP POLICY IF EXISTS "public_comment_posts" ON public.blog_comments;
CREATE POLICY "public_comment_posts"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_comments" ON public.blog_comments;
CREATE POLICY "public_read_comments"
  ON public.blog_comments
  FOR SELECT
  USING (true);
```

### 3. Create Storage Bucket

In the Supabase dashboard:
1. Go to **Storage**
2. Click **Create a new bucket**
3. Name it `blog-images`
4. Set it as **Public**
5. Set file size limit to 5 MB
6. Click **Create bucket**

### 4. Add Sample Data (Optional)

```sql
-- Insert a sample blog post
INSERT INTO public.blog_posts (title, content, excerpt, author_name, status, published_at)
VALUES (
  'Welcome to AD Club',
  'This is our first blog post! Welcome to the Advertising Club...',
  'Welcome to the Advertising Club blog',
  'AD Club',
  'published',
  CURRENT_TIMESTAMP
);
```

## Verification

After setup, you should be able to:
- Visit `/blog` to see published blog posts
- Visit `/admin/blog` (after logging in) to manage blog posts
- Upload images to the blog in the admin section

## Troubleshooting

If you encounter issues:

1. **"No tables found"** - Ensure you've executed the SQL setup above
2. **"Storage bucket not found"** - Create the `blog-images` bucket in Supabase Storage
3. **"Permission denied"** - Check RLS policies are enabled correctly
4. **"Authentication required"** - Make sure you're logged in to access admin features

For more help, check the [Supabase documentation](https://supabase.com/docs).
