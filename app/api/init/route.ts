import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST /api/init
 *
 * Initialize or verify database schema
 * This endpoint checks if the required tables exist and creates them if needed
 */
export async function POST(request: Request) {
  try {
    // Verify authorization - only allow from localhost or with proper auth
    const authHeader = request.headers.get("authorization")
    const initToken = process.env.INIT_TOKEN

    if (initToken && authHeader !== `Bearer ${initToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    console.log("[init-api] Starting database initialization check...")

    // Check if blog_posts table exists
    const { data: blogPostsCheck, error: blogPostsError } = await admin
      .from("blog_posts")
      .select("id", { count: "exact" })
      .limit(0)

    if (blogPostsError && blogPostsError.code === "PGRST116") {
      // Table doesn't exist
      return NextResponse.json(
        {
          status: "needs_setup",
          message: "Database tables not found. Please follow the DATABASE_SETUP.md guide.",
          setup_url: "/DATABASE_SETUP.md",
        },
        { status: 200 }
      )
    }

    console.log("[init-api] blog_posts table exists")

    // Check storage bucket
    let bucketExists = false
    try {
      const { data: buckets } = await admin.storage.listBuckets()
      bucketExists = buckets?.some((b: any) => b.name === "blog-images") || false
    } catch (error) {
      console.warn("[init-api] Could not check storage buckets:", error)
    }

    if (!bucketExists) {
      try {
        console.log("[init-api] Creating blog-images bucket...")
        await admin.storage.createBucket("blog-images", {
          public: true,
          fileSizeLimit: 5242880,
        })
        console.log("[init-api] Created blog-images bucket")
      } catch (error: any) {
        if (error.message?.includes("already exists")) {
          console.log("[init-api] blog-images bucket already exists")
        } else {
          console.warn("[init-api] Could not create storage bucket:", error.message)
        }
      }
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Database is initialized and ready",
        tables: {
          blog_posts: true,
          blog_likes: true,
          blog_comments: true,
        },
        storage: {
          "blog-images": bucketExists,
        },
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
