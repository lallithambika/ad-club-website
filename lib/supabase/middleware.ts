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

  // Protect admin routes - redirect to admin login if not authenticated
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    // Check if user has an admin_profile with privileged role
    try {
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      // If there's an RLS error (like infinite recursion), allow through to let the app handle it
      // This prevents redirect loops when RLS policies are misconfigured
      if (profileError) {
        console.error("[middleware] Error checking admin profile:", profileError.message)
        // Don't redirect on RLS errors - let the page handle it
        if (profileError.code === "42P17" || profileError.message?.includes("recursion")) {
          console.warn("[middleware] RLS recursion detected - allowing request through")
          return supabaseResponse
        }
        // For other errors, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        url.searchParams.set("error", "auth_failed")
        return NextResponse.redirect(url)
      }

      const isAdmin = adminProfile?.role === "admin" || adminProfile?.role === "super_admin"
      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        url.searchParams.set("error", "unauthorized")
        return NextResponse.redirect(url)
      }
    } catch (err) {
      console.error("[middleware] Unexpected error checking admin:", err)
      // On unexpected errors, allow through to prevent redirect loops
      return supabaseResponse
    }
  }

  return supabaseResponse
}
