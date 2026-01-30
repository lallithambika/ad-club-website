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

    const { data: adminProfile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("id, role, name, email")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[auth-callback] Error checking admin profile", profileError)
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", baseUrl))
    }

    let finalProfile = adminProfile
    if (!adminProfile && session.user.email) {
      const payload = {
        id: session.user.id,
        name: (session.user.user_metadata?.full_name as string) || session.user.email.split("@")[0],
        email: session.user.email,
        role: "admin",
      }
      const { data: inserted, error: insertError } = await supabase
        .from("admin_profiles")
        .insert(payload)
        .select("role")
        .single()

      if (insertError || !inserted) {
        console.warn("[auth-callback] Anon insert failed, trying with service role", insertError?.message)
        try {
          const admin = createAdminClient()
          const { data: adminInserted, error: adminInsertError } = await admin
            .from("admin_profiles")
            .upsert(payload, { onConflict: "id" })
            .select("role")
            .single()
          if (adminInsertError || !adminInserted) {
            console.error("[auth-callback] Error creating admin profile (service role)", adminInsertError)
            return NextResponse.redirect(new URL("/admin/login?error=unauthorized", baseUrl))
          }
          finalProfile = adminInserted
        } catch (e) {
          console.error("[auth-callback] Error creating admin profile", e)
          return NextResponse.redirect(new URL("/admin/login?error=unauthorized", baseUrl))
        }
      } else {
        finalProfile = inserted
      }
    }

    if (!finalProfile || !["admin", "super_admin"].includes(finalProfile.role)) {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", baseUrl))
    }

    return NextResponse.redirect(new URL(next, baseUrl))
  } catch (err) {
    console.error("[auth-callback] Unexpected error", err)
    return NextResponse.redirect(new URL("/admin/login?error=auth_failed", baseUrl))
  }
}
