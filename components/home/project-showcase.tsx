import { createClient } from "@/lib/supabase/server"
import { ProjectShowcaseGrid } from "./project-showcase-grid"

export async function ProjectShowcase() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, tech_stack, image_url")
    .order("created_at", { ascending: false })
    .limit(6)

  return <ProjectShowcaseGrid projects={projects ?? []} />
}
