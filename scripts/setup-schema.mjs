import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupSchema() {
  try {
    console.log('Setting up blog schema...')

    // Create blog_posts table
    const { error: postsError } = await supabase.rpc('exec', {
      sql: `
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
      `,
    })

    if (postsError && !postsError.message.includes('already exists')) {
      console.error('Error creating blog_posts:', postsError)
      throw postsError
    }
    console.log('✓ blog_posts table ready')

    // Create blog_likes table
    const { error: likesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.blog_likes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
          user_identifier TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(post_id, user_identifier)
        );
      `,
    })

    if (likesError && !likesError.message.includes('already exists')) {
      console.error('Error creating blog_likes:', likesError)
      throw likesError
    }
    console.log('✓ blog_likes table ready')

    // Create blog_comments table
    const { error: commentsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.blog_comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
          user_name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `,
    })

    if (commentsError && !commentsError.message.includes('already exists')) {
      console.error('Error creating blog_comments:', commentsError)
      throw commentsError
    }
    console.log('✓ blog_comments table ready')

    console.log('✓ Schema setup complete')
  } catch (error) {
    console.error('Schema setup failed:', error)
    process.exit(1)
  }
}

setupSchema()
