import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Sign up with Supabase Auth
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email.split("@")[0],
        },
      },
    })

    if (authError) {
      console.error("[signup] Auth error:", authError.message)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 }
      )
    }

    // Create admin profile using service role
    try {
      const admin = createAdminClient()
      const { error: profileError } = await admin
        .from("admin_profiles")
        .upsert(
          {
            id: authData.user.id,
            name: name || email.split("@")[0],
            email,
            role: "admin",
          },
          { onConflict: "id" }
        )

      if (profileError) {
        console.warn("[signup] Could not create admin profile:", profileError.message)
        // Don't fail - profile can be created later
      }
    } catch (e) {
      console.warn("[signup] Error creating admin profile:", e)
      // Don't fail - profile can be created later
    }

    return NextResponse.json(
      {
        message: "Signup successful. Please check your email to confirm.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[signup] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
