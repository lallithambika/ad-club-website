import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

function mapCategory(c: string) {
  if (c === "Web") return "web"
  if (c === "Mobile") return "mobile"
  if (c === "Community") return "web"
  return "web"
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("response" in auth) return auth.response

  try {
    const body = await request.json()
    const title = body.name ?? body.title
    if (!title || body.description === undefined) {
      return NextResponse.json(
        { ok: false, error: "Project name and description are required" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("projects")
      .insert({
        title,
        description: body.description ?? "",
        category: mapCategory(body.category ?? "Web"),
        tech_stack: Array.isArray(body.techStack) ? body.techStack : [],
        team_size: body.teamSize ?? 1,
        github_url: body.githubLink ?? null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/admin/projects] POST error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        name: data.title,
        description: data.description ?? "",
        techStack: (data.tech_stack as string[]) ?? [],
        teamSize: data.team_size ?? 1,
        githubLink: data.github_url ?? "",
        category: body.category ?? "Web",
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
      return NextResponse.json({ ok: false, error: "Project id is required" }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.title = body.name
    if (body.description !== undefined) payload.description = body.description
    if (body.category !== undefined) payload.category = mapCategory(body.category)
    if (body.techStack !== undefined) payload.tech_stack = body.techStack
    if (body.teamSize !== undefined) payload.team_size = body.teamSize
    if (body.githubLink !== undefined) payload.github_url = body.githubLink

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("[api/admin/projects] PATCH error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: data
        ? {
            id: data.id,
            name: data.title,
            description: data.description ?? "",
            techStack: (data.tech_stack as string[]) ?? [],
            teamSize: data.team_size ?? 1,
            githubLink: data.github_url ?? "",
            category: body.category,
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
      return NextResponse.json({ ok: false, error: "Project id is required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.from("projects").delete().eq("id", id)

    if (error) {
      console.error("[api/admin/projects] DELETE error:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
