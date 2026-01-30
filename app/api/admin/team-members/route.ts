import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

function mapRoleCategory(rc: string) {
  if (rc === "Faculty") return "faculty"
  if (rc === "Lead") return "lead"
  if (rc === "Domain Lead") return "domain-lead"
  return "member"
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    if (!body.name || !body.role) {
      return NextResponse.json(
        { ok: false, error: "Name and role are required" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("team_members")
      .insert({
        name: body.name,
        role: mapRoleCategory(body.roleCategory ?? "Core Team"),
        position: body.role ?? null,
        image_url: body.profileImage || null,
        linkedin_url: body.linkedinLink || null,
        github_url: body.githubLink || null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/admin/team-members] POST error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        name: data.name,
        role: data.position ?? data.role,
        roleCategory: body.roleCategory ?? "Core Team",
        profileImage: data.image_url ?? undefined,
        linkedinLink: data.linkedin_url ?? undefined,
        githubLink: data.github_url ?? undefined,
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
      return NextResponse.json({ ok: false, error: "Team member id is required" }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.name = body.name
    if (body.role !== undefined) payload.position = body.role
    if (body.roleCategory !== undefined) payload.role = mapRoleCategory(body.roleCategory)
    if (body.profileImage !== undefined) payload.image_url = body.profileImage
    if (body.linkedinLink !== undefined) payload.linkedin_url = body.linkedinLink
    if (body.githubLink !== undefined) payload.github_url = body.githubLink

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("team_members")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("[api/admin/team-members] PATCH error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: data
        ? {
            id: data.id,
            name: data.name,
            role: data.position ?? data.role,
            roleCategory: body.roleCategory,
            profileImage: data.image_url ?? undefined,
            linkedinLink: data.linkedin_url ?? undefined,
            githubLink: data.github_url ?? undefined,
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
      return NextResponse.json({ ok: false, error: "Team member id is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("team_members").delete().eq("id", id)

    if (error) {
      console.error("[api/admin/team-members] DELETE error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
