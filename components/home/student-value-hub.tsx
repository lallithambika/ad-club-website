"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Map,
  BookOpen,
  Trophy,
  Library,
  ArrowRight,
} from "lucide-react"

const hubs = [
  {
    icon: Briefcase,
    title: "Interview Experiences",
    description: "Real interview stories, tips, and company-specific prep from placed members.",
    href: "/blog",
    cta: "Read experiences",
  },
  {
    icon: Map,
    title: "Placement Roadmaps",
    description: "Step-by-step guides for internships and full-time roles.",
    href: "/blog",
    cta: "View roadmaps",
  },
  {
    icon: BookOpen,
    title: "Weekly Tech Bites",
    description: "Short reads on frameworks, design, and branding every week.",
    href: "/blog",
    cta: "Read latest",
  },
  {
    icon: Trophy,
    title: "Mini Challenges",
    description: "Coding, design, and branding challenges. Compete and learn.",
    href: "/events",
    cta: "Join challenge",
  },
  {
    icon: Library,
    title: "Resource Hub",
    description: "Curated links, PDFs, playlists, and tools for your journey.",
    href: "/contact",
    cta: "Get access",
  },
]

export function StudentValueHub() {
  return (
    <section className="border-t border-border/50 bg-muted/10 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Student Value Hub
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Built for Your Growth
          </h2>
          <p className="mt-3 text-muted-foreground">
            Interview prep, roadmaps, tech bites, challenges, and resources — all in one place.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
              >
                <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <Link href={item.href}>
                        {item.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
