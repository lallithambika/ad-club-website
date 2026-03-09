-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  image_url VARCHAR(500),
  author_name VARCHAR(100),
  author_email VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category VARCHAR(100),
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID,
  user_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_email)
);

-- Create indexes for blog_likes
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_email ON public.blog_likes(user_email);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for blog_comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Blog posts: Public can read published posts
DROP POLICY IF EXISTS "public_read_published_posts" ON public.blog_posts;
CREATE POLICY "public_read_published_posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Blog posts: Admin (service role) can do everything
DROP POLICY IF EXISTS "admin_all_operations" ON public.blog_posts;
CREATE POLICY "admin_all_operations"
  ON public.blog_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Blog likes: Public can read all likes
DROP POLICY IF EXISTS "public_read_likes" ON public.blog_likes;
CREATE POLICY "public_read_likes"
  ON public.blog_likes
  FOR SELECT
  USING (true);

-- Blog likes: Anyone can insert/update/delete (track anonymous likes)
DROP POLICY IF EXISTS "public_write_likes" ON public.blog_likes;
CREATE POLICY "public_write_likes"
  ON public.blog_likes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Blog comments: Public can read approved comments
DROP POLICY IF EXISTS "public_read_approved_comments" ON public.blog_comments;
CREATE POLICY "public_read_approved_comments"
  ON public.blog_comments
  FOR SELECT
  USING (status = 'approved');

-- Blog comments: Public can insert comments
DROP POLICY IF EXISTS "public_insert_comments" ON public.blog_comments;
CREATE POLICY "public_insert_comments"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (true);

-- Blog comments: Admin can do everything
DROP POLICY IF EXISTS "admin_comments_all" ON public.blog_comments;
CREATE POLICY "admin_comments_all"
  ON public.blog_comments
  FOR ALL
  USING (true)
  WITH CHECK (true);
