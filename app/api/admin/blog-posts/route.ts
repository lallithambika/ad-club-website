import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    const content = body.content ?? ""
    if (!content.trim()) {
      return NextResponse.json(
        { ok: false, error: "Content is required" },
        { status: 400 }
      )
    }
    const title = (body.title ?? "").trim() || "Untitled"

    const tags = Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [])
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("blog_posts")
      .insert({
        title,
        content: content.trim(),
        tags,
        status: body.status ?? "draft",
        featured: body.featured ?? false,
        cover_image_url: body.cover_image_url ?? body.coverImageUrl ?? null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/admin/blog-posts] POST error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    const id = body.id
    if (!id) {
      return NextResponse.json({ ok: false, error: "Post id is required" }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (body.title !== undefined) payload.title = body.title
    if (body.content !== undefined) payload.content = body.content
    if (body.tags !== undefined) {
      payload.tags = Array.isArray(body.tags) ? body.tags : (String(body.tags).split(",").map((t: string) => t.trim()).filter(Boolean))
    }
    if (body.status !== undefined) payload.status = body.status
    if (body.featured !== undefined) payload.featured = body.featured
    if (body.cover_image_url !== undefined) payload.cover_image_url = body.cover_image_url
    if (body.coverImageUrl !== undefined) payload.cover_image_url = body.coverImageUrl

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("blog_posts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("[api/admin/blog-posts] PATCH error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ ok: false, error: "Post id is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("blog_posts").delete().eq("id", id)

    if (error) {
      console.error("[api/admin/blog-posts] DELETE error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
