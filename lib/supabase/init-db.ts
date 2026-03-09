import { createAdminClient } from "./admin"

/**
 * Initialize the database schema for the AD Club website
 * This function provides setup guidance - actual table creation should be done in Supabase SQL editor
 */
export async function initializeDatabase() {
  const admin = createAdminClient()

  try {
    console.log("[init-db] Checking database schema...")

    // Check if blog_posts table exists by trying to query it
    const { data, error } = await admin.from("blog_posts").select("id").limit(1)

    if (error) {
      console.error("[init-db] blog_posts table does not exist. Please run the SQL setup in Supabase.")
      console.error(
        "[init-db] Instructions: Go to Supabase dashboard > SQL Editor > Copy and run the schema setup SQL"
      )
      throw new Error("Database tables not initialized")
    }

    console.log("[init-db] Database tables exist")

    // Check if storage bucket exists
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

    console.log("[init-db] Database initialization check completed")
    return { success: true }
  } catch (error) {
    console.error("[init-db] Initialization error:", error)
    throw error
  }
}
