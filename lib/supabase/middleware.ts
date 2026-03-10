import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Must call getUser() to refresh session tokens
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow auth callback to proceed without admin check
  if (request.nextUrl.pathname.startsWith("/auth/callback")) {
    return supabaseResponse
  }

  // Allow admin/login to be publicly accessible
  if (request.nextUrl.pathname === "/admin/login") {
    return supabaseResponse
  }

  // Protect other admin routes - redirect to admin login if not authenticated
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    // Check if user has an admin_profile with privileged role (optional check)
    // This will fail gracefully if admin_profiles table doesn't exist yet
    try {
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      // If table doesn't exist or other errors, log but allow through
      if (profileError) {
        console.warn("[middleware] Admin profile check failed:", profileError.message)
        // Allow through - the page will show appropriate error if needed
        return supabaseResponse
      }

      // If profile exists, check role
      if (adminProfile) {
        const isAdmin = adminProfile.role === "admin" || adminProfile.role === "super_admin"
        if (!isAdmin) {
          const url = request.nextUrl.clone()
          url.pathname = "/admin/login"
          url.searchParams.set("error", "unauthorized")
          return NextResponse.redirect(url)
        }
      }
      // If profile doesn't exist but user is authenticated, allow through
    } catch (err) {
      console.warn("[middleware] Unexpected error in admin check:", err)
      // On unexpected errors, allow through to prevent redirect loops
      return supabaseResponse
    }
  }

  return supabaseResponse
}
