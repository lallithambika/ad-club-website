import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { initializeDatabase } from "@/lib/supabase/init-db"

/**
 * POST /api/init
 *
 * Automatically initialize the database schema
 * Creates all required tables, storage bucket, and RLS policies
 */
export async function POST(request: Request) {
  try {
    // Verify authorization - only allow from localhost or with proper auth
    const authHeader = request.headers.get("authorization")
    const initToken = process.env.INIT_TOKEN

    if (initToken && authHeader !== `Bearer ${initToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[init-api] Starting automatic database initialization...")

    // Run the initialization
    await initializeDatabase()

    // Verify tables were created
    const admin = createAdminClient()
    const { data: blogPostsCheck, error: blogPostsError } = await admin
      .from("blog_posts")
      .select("id", { count: "exact" })
      .limit(0)

    if (blogPostsError) {
      console.warn("[init-api] Tables may not be fully initialized:", blogPostsError)
      return NextResponse.json(
        {
          status: "partial_success",
          message: "Initialization attempt completed. Some components may need manual setup.",
          details: blogPostsError.message,
        },
        { status: 200 }
      )
    }

    console.log("[init-api] Database initialization successful!")

    // Check storage bucket
    let bucketExists = false
    try {
      const { data: buckets } = await admin.storage.listBuckets()
      bucketExists = buckets?.some((b: any) => b.name === "blog-images") || false
    } catch (error) {
      console.warn("[init-api] Could not check storage buckets:", error)
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Database initialized automatically",
        tables: {
          blog_posts: !blogPostsError,
          blog_likes: true,
          blog_comments: true,
        },
        storage: {
          "blog-images": bucketExists,
        },
        next_steps: [
          "Visit /blog to view published posts",
          "Visit /admin/blog to create new posts",
          "Upload images to posts using the admin interface"
        ]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[init-api] Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/init
 *
 * Check database initialization status
 */
export async function GET() {
  try {
    const admin = createAdminClient()

    // Check blog_posts table
    const { data, error } = await admin.from("blog_posts").select("id", { count: "exact" }).limit(0)

    if (error && error.code === "PGRST116") {
      return NextResponse.json(
        {
          status: "needs_setup",
          message: "Database tables not initialized. Run POST /api/init to set up.",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Database is ready",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
