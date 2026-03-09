-- Create blog_posts table with proper structure
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_likes table for engagement tracking
CREATE TABLE IF NOT EXISTS public.blog_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(post_id, user_identifier)
);

-- Create blog_comments table for engagement tracking
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Blog posts: public can read published posts, authenticated users (admins) can manage all
DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_published_blog_posts"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published' OR EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    ));

DROP POLICY IF EXISTS "admin_manage_blog_posts" ON public.blog_posts;
CREATE POLICY "admin_manage_blog_posts"
    ON public.blog_posts
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE admin_profiles.id = auth.uid()
        AND admin_profiles.role IN ('admin', 'super_admin')
    ));

-- Blog likes: anyone can read, anyone can insert their own likes
DROP POLICY IF EXISTS "public_read_blog_likes" ON public.blog_likes;
CREATE POLICY "public_read_blog_likes"
    ON public.blog_likes
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "public_insert_blog_likes" ON public.blog_likes;
CREATE POLICY "public_insert_blog_likes"
    ON public.blog_likes
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_own_blog_likes" ON public.blog_likes;
CREATE POLICY "public_delete_own_blog_likes"
    ON public.blog_likes
    FOR DELETE
    USING (true);

-- Blog comments: anyone can read, anyone can insert
DROP POLICY IF EXISTS "public_read_blog_comments" ON public.blog_comments;
CREATE POLICY "public_read_blog_comments"
    ON public.blog_comments
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "public_insert_blog_comments" ON public.blog_comments;
CREATE POLICY "public_insert_blog_comments"
    ON public.blog_comments
    FOR INSERT
    WITH CHECK (true);
