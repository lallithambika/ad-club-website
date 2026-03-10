import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/admin/dashboard"
  const baseUrl = requestUrl.origin

  if (!code) {
    return NextResponse.redirect(new URL("/", baseUrl))
  }

  try {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[auth-callback] Error exchanging code", exchangeError)
      return NextResponse.redirect(new URL("/admin/login?error=auth_failed", baseUrl))
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.redirect(new URL("/", baseUrl))
    }

    let finalProfile: any = null

    // Try to get or create admin profile
    try {
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("id, role, name, email")
        .eq("id", session.user.id)
        .maybeSingle()

      // If table doesn't exist, allow login anyway - will create profile on first access
      if (profileError?.code === 'PGRST205' || profileError?.message?.includes("Could not find the table")) {
        console.log("[auth-callback] admin_profiles table not found, creating automatically...")
        finalProfile = {
          id: session.user.id,
          role: "admin",
          name: (session.user.user_metadata?.full_name as string) || session.user.email?.split("@")[0],
          email: session.user.email,
        }
      } else if (profileError) {
        console.error("[auth-callback] Error checking admin profile", profileError)
        // If there's any error but it's not a missing table, still allow login
        finalProfile = {
          id: session.user.id,
          role: "admin",
          name: (session.user.user_metadata?.full_name as string) || session.user.email?.split("@")[0],
          email: session.user.email,
        }
      } else if (adminProfile) {
        finalProfile = adminProfile
      } else if (session.user.email) {
        // Create new admin profile
        const payload = {
          id: session.user.id,
          name: (session.user.user_metadata?.full_name as string) || session.user.email.split("@")[0],
          email: session.user.email,
          role: "admin",
        }

        try {
          const admin = createAdminClient()
          const { data: adminInserted, error: adminInsertError } = await admin
            .from("admin_profiles")
            .upsert(payload, { onConflict: "id" })
            .select("role")
            .single()

          if (!adminInsertError && adminInserted) {
            finalProfile = adminInserted
          } else {
            // If creation fails, still allow login
            console.warn("[auth-callback] Could not create admin profile:", adminInsertError?.message)
            finalProfile = payload
          }
        } catch (e) {
          console.warn("[auth-callback] Error creating admin profile", e)
          finalProfile = payload
        }
      }
    } catch (e) {
      console.warn("[auth-callback] Error in profile handling", e)
      // If anything fails, still allow admin to proceed
      finalProfile = {
        id: session.user.id,
        role: "admin",
        name: (session.user.user_metadata?.full_name as string) || session.user.email?.split("@")[0],
        email: session.user.email,
      }
    }

    return NextResponse.redirect(new URL(next, baseUrl))
  } catch (err) {
    console.error("[auth-callback] Unexpected error", err)
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", baseUrl))
  }
}
