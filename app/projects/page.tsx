"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Github, Users, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const projects = [
  {
    id: 1,
    title: "CampusConnect",
    description: "A mobile app connecting students across campus for events, study groups, and networking.",
    techStack: ["Flutter", "Firebase", "Node.js"],
    teamSize: 4,
    category: "Mobile Apps",
    status: "In Development",
    github: "#",
  },
  {
    id: 2,
    title: "EcoTrack",
    description: "Sustainability tracking app that helps users monitor and reduce their carbon footprint.",
    techStack: ["React Native", "MongoDB", "Express"],
    teamSize: 3,
    category: "Mobile Apps",
    status: "Completed",
    github: "#",
  },
  {
    id: 3,
    title: "AD Club Portal",
    description: "Official club management portal for event registrations, member management, and resources.",
    techStack: ["Next.js", "PostgreSQL", "Tailwind"],
    teamSize: 5,
    category: "Web Apps",
    status: "Completed",
    github: "#",
  },
  {
    id: 4,
    title: "StudyBuddy AI",
    description: "AI-powered study companion that creates personalized quizzes and learning paths.",
    techStack: ["React", "Python", "OpenAI"],
    teamSize: 3,
    category: "Web Apps",
    status: "In Development",
    github: "#",
  },
  {
    id: 5,
    title: "Event Manager",
    description: "Internal tool for managing club events, sending notifications, and tracking attendance.",
    techStack: ["Vue.js", "Firebase", "Vuetify"],
    teamSize: 2,
    category: "Internal Tools",
    status: "Completed",
    github: "#",
  },
  {
    id: 6,
    title: "Code Review Bot",
    description: "GitHub bot that provides automated code review suggestions for club projects.",
    techStack: ["Node.js", "GitHub API", "Docker"],
    teamSize: 2,
    category: "Internal Tools",
    status: "Completed",
    github: "#",
  },
  {
    id: 7,
    title: "LocalBiz",
    description: "Platform connecting local businesses with customers, featuring deals and reviews.",
    techStack: ["React", "Node.js", "MongoDB"],
    teamSize: 6,
    category: "Community Projects",
    status: "In Development",
    github: "#",
  },
  {
    id: 8,
    title: "AccessEd",
    description: "Educational platform making learning materials accessible to students with disabilities.",
    techStack: ["Next.js", "AWS", "PostgreSQL"],
    teamSize: 4,
    category: "Community Projects",
    status: "Completed",
    github: "#",
  },
]

const categories = ["All", "Mobile Apps", "Web Apps", "Internal Tools", "Community Projects"]

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(project => project.category === activeCategory)

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#a855f7]/5 via-[#6366f1]/5 to-[#22d3ee]/5 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Projects</p>
              <h1 className="text-balance text-4xl font-bold text-foreground md:text-5xl">
                Our Project Showcase
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Explore the innovative projects built by AD Club members
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-background py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium text-muted-foreground">Category:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? "bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="group flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Project Header Visual */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#a855f7]/20 to-[#22d3ee]/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl font-bold text-primary/20">{project.title.charAt(0)}</div>
                    </div>
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute right-3 top-3 ${
                        project.status === "In Development" 
                          ? "bg-amber-500/90 text-white hover:bg-amber-500" 
                          : "bg-green-500/90 text-white hover:bg-green-500"
                      }`}
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{project.teamSize}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-foreground">{project.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <CardDescription className="mb-4 flex-1 text-muted-foreground">
                      {project.description}
                    </CardDescription>
                    
                    {/* Tech Stack */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {project.techStack.map((tech, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent" asChild>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <ExternalLink className="h-4 w-4" />
                        Demo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
