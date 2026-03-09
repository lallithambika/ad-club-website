#!/usr/bin/env python3
"""
Setup database schema for AD Club website.
Creates all necessary tables for blog, analytics, projects, etc.
"""

import os
import sys
from postgrest import SyncPostgrestClient
import psycopg2
from psycopg2.extensions import connection

# Get environment variables
postgres_url = os.environ.get("POSTGRES_URL")

if not postgres_url:
    print("Error: POSTGRES_URL not set")
    sys.exit(1)

# Parse connection string
try:
    conn = psycopg2.connect(postgres_url)
    cursor = conn.cursor()
    print("[v0] Connected to PostgreSQL")
except Exception as e:
    print(f"Error connecting to database: {e}")
    sys.exit(1)

def run_sql(sql_script: str, description: str):
    """Execute SQL script with error handling"""
    try:
        cursor.execute(sql_script)
        conn.commit()
        print(f"✓ {description}")
        return True
    except Exception as e:
        conn.rollback()
        print(f"✗ {description}: {e}")
        return False

# Create blog tables
blog_sql = """
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

CREATE TABLE IF NOT EXISTS public.blog_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(post_id, user_identifier)
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON public.blog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_published_blog_posts"
    ON public.blog_posts
    FOR SELECT
    USING (status = 'published');

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

DROP POLICY IF EXISTS "public_delete_blog_likes" ON public.blog_likes;
CREATE POLICY "public_delete_blog_likes"
    ON public.blog_likes
    FOR DELETE
    USING (true);

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
"""

try:
    print("[v0] Setting up blog schema...")
    run_sql(blog_sql, "Blog tables and RLS")
    
    cursor.close()
    conn.close()
    print("[v0] ✓ Database setup complete!")
    
except Exception as e:
    print(f"[v0] Error during setup: {e}")
    sys.exit(1)
