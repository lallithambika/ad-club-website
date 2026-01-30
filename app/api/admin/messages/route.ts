import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    const id = body.id
    if (!id) {
      return NextResponse.json({ ok: false, error: "Message id is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id)

    if (error) {
      console.error("[api/admin/messages] PATCH error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
