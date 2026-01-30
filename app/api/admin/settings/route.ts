import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
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
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const payload: Record<string, string> = {}
    if (body.clubEmail !== undefined) payload.club_email = body.clubEmail
    if (body.instagramLink !== undefined) payload.instagram_url = body.instagramLink
    if (body.linkedinLink !== undefined) payload.linkedin_url = body.linkedinLink
    if (body.githubLink !== undefined) payload.github_url = body.githubLink
    if (body.twitterLink !== undefined) payload.twitter_url = body.twitterLink

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data: existing } = await admin
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      const { data, error } = await admin
        .from("settings")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .maybeSingle()

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        )
      }
      return NextResponse.json({
        ok: true,
        data: data
          ? {
              clubEmail: data.club_email ?? "",
              instagramLink: data.instagram_url ?? "",
              linkedinLink: data.linkedin_url ?? "",
              githubLink: data.github_url ?? "",
              twitterLink: data.twitter_url ?? "",
            }
          : undefined,
      })
    }

    const { data, error } = await admin
      .from("settings")
      .insert(payload)
      .select("*")
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({
      ok: true,
      data: data
        ? {
            clubEmail: data.club_email ?? "",
            instagramLink: data.instagram_url ?? "",
            linkedinLink: data.linkedin_url ?? "",
            githubLink: data.github_url ?? "",
            twitterLink: data.twitter_url ?? "",
          }
        : undefined,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error"
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
