import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    const title = body.name ?? body.title
    if (!title || !body.date) {
      return NextResponse.json(
        { ok: false, error: "Event name and date are required" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("events")
      .insert({
        title,
        description: body.description ?? null,
        date: body.date,
        category: body.category === "Workshop" ? "workshop" : body.category === "Hackathon" ? "hackathon" : "guest-lecture",
        status: body.status === "Upcoming" ? "upcoming" : "completed",
        image_url: body.posterUrl || null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/admin/events] POST error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        name: data.title,
        date: data.date,
        category: data.category,
        status: data.status === "upcoming" ? "Upcoming" : "Completed",
        description: data.description ?? "",
        posterUrl: data.image_url ?? undefined,
        createdAt: data.created_at,
      },
    })
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
      return NextResponse.json({ ok: false, error: "Event id is required" }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.title = body.name
    if (body.description !== undefined) payload.description = body.description
    if (body.date !== undefined) payload.date = body.date
    if (body.category !== undefined) {
      payload.category =
        body.category === "Workshop"
          ? "workshop"
          : body.category === "Hackathon"
            ? "hackathon"
            : "guest-lecture"
    }
    if (body.status !== undefined) {
      payload.status = body.status === "Upcoming" ? "upcoming" : "completed"
    }
    if (body.posterUrl !== undefined) payload.image_url = body.posterUrl

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("events")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("[api/admin/events] PATCH error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: data
        ? {
            id: data.id,
            name: data.title,
            date: data.date,
            category: data.category,
            status: data.status === "upcoming" ? "Upcoming" : "Completed",
            description: data.description ?? "",
            posterUrl: data.image_url ?? undefined,
            createdAt: data.created_at,
          }
        : undefined,
    })
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
      return NextResponse.json({ ok: false, error: "Event id is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("events").delete().eq("id", id)

    if (error) {
      console.error("[api/admin/events] DELETE error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
