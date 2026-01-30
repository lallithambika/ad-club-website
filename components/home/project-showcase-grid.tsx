"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

type Project = {
  id: string
  title: string
  description: string | null
  tech_stack: string[] | null
  image_url: string | null
}

export function ProjectShowcaseGrid({ projects }: { projects: Project[] }) {
  return (
    <section className="border-t border-border/50 bg-muted/10 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Project Showcase
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            What We&apos;ve Built
          </h2>
          <p className="mt-3 text-muted-foreground">
            Apps, websites, and tools by AD Club members. Hover to peek.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {projects.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="gap-2 shadow-glow">
              <Link href="/projects">
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
            <p className="text-muted-foreground">No projects yet. Check back soon.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/projects">Projects</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <Link href={`/projects#${project.id}`}>
        <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
          <div className="relative aspect-video overflow-hidden bg-muted">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span className="text-4xl font-bold opacity-20">
                  {project.title[0]}
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground group-hover:text-primary">
              {project.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {project.description || "No description."}
            </p>
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech_stack.slice(0, 4).map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-[10px] font-medium"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
