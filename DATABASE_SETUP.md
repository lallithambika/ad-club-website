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
CREATE INDEX IF NOT EXISTS blog_posts_created_idx ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_likes_post_idx ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS blog_likes_user_idx ON public.blog_likes(user_id);
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

### 3. Create Storage Bucket and Policies

**Create the bucket:**
1. Go to Supabase dashboard > **Storage**
2. Click **Create a new bucket**
3. Name it `blog-images`
4. Set it as **Public**
5. Set file size limit to 5 MB
6. Click **Create bucket**

**Add Storage Policies:**

Copy and paste the following SQL to enable public read access and authenticated write access:

```sql
-- Create storage policies for blog-images bucket
-- Allow public read access to all files in blog-images
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload files to blog-images
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
```

Or use the Supabase Storage UI to set policies:
1. Go to Storage > blog-images > Policies
2. Create a SELECT policy allowing public access
3. Create an INSERT policy allowing authenticated uploads

### 4. Add Sample Data (Optional)

```sql
-- Insert a sample blog post
INSERT INTO public.blog_posts (title, content, tags, status, featured)
VALUES (
  'Welcome to AD Club',
  'This is our first blog post! Welcome to the Advertising Club. We are excited to share our journey in application development and digital marketing.',
  ARRAY['welcome', 'club', 'announcement'],
  'published',
  true
);

-- Insert another sample post
INSERT INTO public.blog_posts (title, content, tags, status)
VALUES (
  'Getting Started with Web Development',
  'Learn the basics of web development including HTML, CSS, and JavaScript. This guide will help you understand the fundamentals...',
  ARRAY['webdev', 'tutorial', 'beginner'],
  'published'
);
```

## Verification

After setup, you should be able to:
- Visit `/blog` to see published blog posts
- Visit `/admin/blog` (after logging in) to manage blog posts
- Upload images to the blog in the admin section
- Like and comment on published posts

## Troubleshooting

### Database Issues

| Error | Solution |
|-------|----------|
| **"No tables found"** | Ensure you've executed all SQL setup commands in the SQL Editor |
| **"Permission denied" on blog_posts** | Check that RLS policies are created correctly and status is set to 'published' |
| **"relation does not exist"** | Run the table creation SQL again, ensuring no errors occurred |
| **"Duplicate key value"** | The table already exists. If you need to reset, use `DROP TABLE public.blog_posts CASCADE;` first |

### Storage Issues

| Error | Solution |
|-------|----------|
| **"Bucket not found"** | Create the `blog-images` bucket in Supabase Storage |
| **"Permission denied" on upload** | Add storage policies as shown in Step 3 |
| **Images not showing** | Ensure the bucket is set to **Public** in Supabase Storage settings |

### Admin Access Issues

| Error | Solution |
|-------|----------|
| **"Login failed"** | Ensure you've set up Supabase Auth in your project |
| **"Cannot access /admin/blog"** | Check that you're logged in and have proper admin credentials |

## Database Schema Reference

### blog_posts table
- `id` - Unique identifier (UUID)
- `title` - Blog post title (required)
- `content` - Blog post content (required)
- `tags` - Array of tags for categorization
- `featured` - Boolean to highlight featured posts
- `status` - 'draft' or 'published'
- `cover_image_url` - URL to the cover image
- `created_at` - Auto-generated timestamp

### blog_likes table
- `id` - Unique identifier (UUID)
- `post_id` - Reference to blog_posts
- `user_id` - User ID who liked the post
- `created_at` - Timestamp of the like

### blog_comments table
- `id` - Unique identifier (UUID)
- `post_id` - Reference to blog_posts
- `user_name` - Name of the commenter
- `message` - Comment content
- `created_at` - Timestamp of the comment

## Next Steps

1. ✅ Create the database schema (SQL executed above)
2. ✅ Set up storage bucket and policies
3. Add sample blog posts through the admin interface at `/admin/blog`
4. Customize your blog with your own content and images
5. Share your blog with users!

For more help, check the [Supabase documentation](https://supabase.com/docs) or the project's [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md).
