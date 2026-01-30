"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const events = [
  {
    id: 1,
    title: "Flutter Workshop Series",
    date: "Feb 15-17, 2026",
    location: "Arena Tech Lab",
    description: "A 3-day intensive workshop covering Flutter basics to advanced state management techniques.",
    category: "Workshops",
    status: "Upcoming",
    attendees: 45,
    image: "/logo.jpeg",
  },
  {
    id: 2,
    title: "HackArena 2026",
    date: "Mar 5-6, 2026",
    location: "Main Auditorium",
    description: "24-hour hackathon with exciting prizes. Build innovative solutions for real-world problems.",
    category: "Hackathons",
    status: "Upcoming",
    attendees: 120,
    image: "/logo.jpeg",
  },
  {
    id: 3,
    title: "Tech Talk: AI in Mobile Apps",
    date: "Feb 28, 2026",
    location: "Virtual Event",
    description: "Industry expert sharing insights on integrating AI/ML features into mobile applications.",
    category: "Guest Lectures",
    status: "Upcoming",
    attendees: 80,
    image: "/logo.jpeg",
  },
  {
    id: 4,
    title: "Web Development Bootcamp",
    date: "Jan 20-22, 2026",
    location: "Arena Tech Lab",
    description: "Comprehensive bootcamp covering React, Next.js, and modern web development practices.",
    category: "Workshops",
    status: "Completed",
    attendees: 38,
    image: "/logo.jpeg",
  },
  {
    id: 5,
    title: "UI/UX Design Sprint",
    date: "Jan 12, 2026",
    location: "Design Studio",
    description: "Hands-on design sprint focusing on user research, wireframing, and prototyping.",
    category: "Workshops",
    status: "Completed",
    attendees: 25,
    image: "/logo.jpeg",
  },
  {
    id: 6,
    title: "CodeClash 2025",
    date: "Dec 15, 2025",
    location: "Main Auditorium",
    description: "Competitive programming contest with teams from multiple colleges participating.",
    category: "Hackathons",
    status: "Completed",
    attendees: 150,
    image: "/logo.jpeg",
  },
]

const categories = ["All", "Workshops", "Hackathons", "Guest Lectures"]

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredEvents = activeCategory === "All" 
    ? events 
    : events.filter(event => event.category === activeCategory)

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#a855f7]/5 via-[#6366f1]/5 to-[#22d3ee]/5 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Events</p>
              <h1 className="text-balance text-4xl font-bold text-foreground md:text-5xl">
                Upcoming & Past Events
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Join us for workshops, hackathons, and tech talks that will boost your skills
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-background py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium text-muted-foreground">Filter by:</span>
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

        {/* Events Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className="group overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Event Image */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#a855f7]/20 to-[#22d3ee]/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl font-bold text-primary/30">AD</div>
                    </div>
                    {/* Status Badge */}
                    <Badge 
                      className={`absolute right-3 top-3 ${
                        event.status === "Upcoming" 
                          ? "bg-green-500/90 text-white hover:bg-green-500" 
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-foreground">{event.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-muted-foreground">
                      {event.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>

                    {event.status === "Upcoming" && (
                      <Button className="w-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white hover:opacity-90">
                        Register Now
                      </Button>
                    )}
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
