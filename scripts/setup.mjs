import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey);

async function executeSql(sql) {
  try {
    const { data, error } = await client.rpc("query_text", { query: sql });
    if (error) throw error;
    console.log("✓ SQL executed successfully");
    return data;
  } catch (err) {
    console.error("✗ SQL execution failed:", err.message);
    throw err;
  }
}

async function main() {
  console.log("🚀 Setting up Supabase schema...\n");

  try {
    // Read and execute the schema SQL
    const schemaPath = path.join(__dirname, "001_create_blog_schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("📝 Creating blog tables and RLS policies...");
    await executeSql(schemaSql);

    // Create storage bucket for blog images
    console.log("📦 Creating storage bucket...");
    try {
      const { data: buckets } = await client.storage.listBuckets();
      const blogBucketExists = buckets?.some((b) => b.name === "blog-images");

      if (!blogBucketExists) {
        const { data, error } = await client.storage.createBucket("blog-images", {
          public: true,
          allowedMimeTypes: ["image/*"],
          fileSizeLimit: 5242880, // 5MB
        });
        if (error) throw error;
        console.log("✓ Created blog-images bucket");
      } else {
        console.log("✓ blog-images bucket already exists");
      }
    } catch (err) {
      console.error("✗ Storage bucket setup failed:", err.message);
    }

    console.log("\n✨ Setup complete!");
  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  }
}

main();
