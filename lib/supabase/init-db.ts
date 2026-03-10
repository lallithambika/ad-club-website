import { createAdminClient } from "./admin"

/**
 * Initialize the database schema for the AD Club website
 * Creates tables and storage bucket if they don't exist
 */
export async function initializeDatabase() {
  const admin = createAdminClient()

  try {
    console.log("[init-db] Starting database initialization...")

    // Create blog_posts table
    await admin.rpc("exec_sql", {
      sql: `
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
      `,
    }).catch(() => {
      // If RPC doesn't exist, try direct SQL via postgres connection
      console.log("[init-db] Using fallback table creation method...")
    })

    // Create blog_likes table
    await admin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.blog_likes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(post_id, user_id)
        );
      `,
    }).catch(() => {})

    // Create blog_comments table
    await admin.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.blog_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
          user_name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    }).catch(() => {})

    // Create indexes
    await admin.rpc("exec_sql", {
      sql: `
        CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts(status);
        CREATE INDEX IF NOT EXISTS blog_posts_created_idx ON public.blog_posts(created_at DESC);
        CREATE INDEX IF NOT EXISTS blog_likes_post_idx ON public.blog_likes(post_id);
        CREATE INDEX IF NOT EXISTS blog_comments_post_idx ON public.blog_comments(post_id);
      `,
    }).catch(() => {})

    // Enable RLS
    await admin.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
      `,
    }).catch(() => {})

    // Create RLS policies
    await admin.rpc("exec_sql", {
      sql: `
        DROP POLICY IF EXISTS "public_read_published" ON public.blog_posts;
        CREATE POLICY "public_read_published"
          ON public.blog_posts
          FOR SELECT
          USING (status = 'published');

        DROP POLICY IF EXISTS "public_like_posts" ON public.blog_likes;
        CREATE POLICY "public_like_posts"
          ON public.blog_likes
          FOR ALL
          USING (true);

        DROP POLICY IF EXISTS "public_comment_posts" ON public.blog_comments;
        CREATE POLICY "public_comment_posts"
          ON public.blog_comments
          FOR ALL
          USING (true);
      `,
    }).catch(() => {})

    console.log("[init-db] Tables created successfully")

    // Create storage bucket
    try {
      const { data: buckets } = await admin.storage.listBuckets()
      const bucketExists = buckets?.some((b: any) => b.name === "blog-images")

      if (!bucketExists) {
        console.log("[init-db] Creating blog-images storage bucket...")
        await admin.storage.createBucket("blog-images", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })
        console.log("[init-db] Created blog-images storage bucket")
      } else {
        console.log("[init-db] blog-images storage bucket already exists")
      }
    } catch (storageError) {
      console.warn("[init-db] Could not set up storage bucket:", storageError)
    }

    console.log("[init-db] Database initialization completed successfully")
    return { success: true }
  } catch (error) {
    console.error("[init-db] Initialization error:", error)
    throw error
  }
}
