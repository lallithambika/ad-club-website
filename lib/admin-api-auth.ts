import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Verifies the request is from an authenticated admin (admin_profiles.role in admin/super_admin).
 * Returns { supabase, user } on success, or a NextResponse to return on failure.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) }
  }

  const { data: adminProfile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (
    !adminProfile ||
    !["admin", "super_admin"].includes(adminProfile.role as string)
  ) {
    return { response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) }
  }

  return { supabase, user }
}
