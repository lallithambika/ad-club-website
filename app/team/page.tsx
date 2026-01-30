import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Github, Linkedin, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const teamMembers = {
  leadership: [
    {
      name: "Dr. Priya Sharma",
      role: "Faculty Advisor",
      description: "Associate Professor, Computer Science Department",
      image: null,
      linkedin: "#",
      github: "#",
      email: "priya.sharma@arena.edu",
    },
    {
      name: "Rahul Verma",
      role: "Club Lead",
      description: "Final Year, Computer Science | Full Stack Developer",
      image: null,
      linkedin: "#",
      github: "#",
      email: "rahul.v@student.arena.edu",
    },
  ],
  leads: [
    {
      name: "Ananya Patel",
      role: "Technical Lead",
      description: "Third Year, IT | Backend & Cloud Specialist",
      image: null,
      linkedin: "#",
      github: "#",
      email: "ananya.p@student.arena.edu",
    },
    {
      name: "Vikram Singh",
      role: "Design Lead",
      description: "Third Year, CS | UI/UX Designer",
      image: null,
      linkedin: "#",
      github: "#",
      email: "vikram.s@student.arena.edu",
    },
  ],
  coreTeam: [
    {
      name: "Sneha Gupta",
      role: "Mobile Dev Lead",
      description: "Third Year | Flutter & Android",
      image: null,
      linkedin: "#",
      github: "#",
    },
    {
      name: "Arjun Reddy",
      role: "Web Dev Lead",
      description: "Second Year | React & Next.js",
      image: null,
      linkedin: "#",
      github: "#",
    },
    {
      name: "Kavya Menon",
      role: "Events Coordinator",
      description: "Second Year | Community Building",
      image: null,
      linkedin: "#",
      github: "#",
    },
    {
      name: "Rohan Joshi",
      role: "Content Lead",
      description: "Second Year | Technical Writing",
      image: null,
      linkedin: "#",
      github: "#",
    },
    {
      name: "Meera Nair",
      role: "Marketing Lead",
      description: "Third Year | Social Media & Outreach",
      image: null,
      linkedin: "#",
      github: "#",
    },
    {
      name: "Aditya Kumar",
      role: "Backend Lead",
      description: "Third Year | Node.js & Python",
      image: null,
      linkedin: "#",
      github: "#",
    },
  ],
}

interface TeamMemberCardProps {
  member: {
    name: string
    role: string
    description: string
    image: string | null
    linkedin?: string
    github?: string
    email?: string
  }
  size?: "large" | "medium" | "small"
}

function TeamMemberCard({ member, size = "small" }: TeamMemberCardProps) {
  const sizeClasses = {
    large: "p-8",
    medium: "p-6",
    small: "p-4",
  }

  const avatarSizes = {
    large: "h-32 w-32 text-4xl",
    medium: "h-24 w-24 text-3xl",
    small: "h-20 w-20 text-2xl",
  }

  return (
    <Card className="group overflow-hidden border-border/50 bg-card text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <CardHeader className={sizeClasses[size]}>
        {/* Avatar Placeholder */}
        <div className={`mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#22d3ee]/20 font-bold text-primary ${avatarSizes[size]}`}>
          {member.name.split(" ").map(n => n[0]).join("")}
        </div>
        <CardTitle className={`text-foreground ${size === "large" ? "text-xl" : "text-lg"}`}>
          {member.name}
        </CardTitle>
        <CardDescription className="font-medium text-primary">
          {member.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">{member.description}</p>
        <div className="flex justify-center gap-2">
          {member.linkedin && (
            <Link
              href={member.linkedin}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`${member.name}'s LinkedIn`}
            >
              <Linkedin className="h-4 w-4" />
            </Link>
          )}
          {member.github && (
            <Link
              href={member.github}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`${member.name}'s GitHub`}
            >
              <Github className="h-4 w-4" />
            </Link>
          )}
          {member.email && (
            <Link
              href={`mailto:${member.email}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Email ${member.name}`}
            >
              <Mail className="h-4 w-4" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#a855f7]/5 via-[#6366f1]/5 to-[#22d3ee]/5 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Our Team</p>
              <h1 className="text-balance text-4xl font-bold text-foreground md:text-5xl">
                Meet the People Behind AD Club
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                A passionate team of students and mentors driving innovation
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Leadership</h2>
              <p className="mt-2 text-muted-foreground">Guiding the club towards excellence</p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {teamMembers.leadership.map((member, index) => (
                <TeamMemberCard key={index} member={member} size="large" />
              ))}
            </div>
          </div>
        </section>

        {/* Domain Leads Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Domain Leads</h2>
              <p className="mt-2 text-muted-foreground">Experts leading their respective domains</p>
            </div>
            <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
              {teamMembers.leads.map((member, index) => (
                <TeamMemberCard key={index} member={member} size="medium" />
              ))}
            </div>
          </div>
        </section>

        {/* Core Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Core Team</h2>
              <p className="mt-2 text-muted-foreground">The driving force behind all our activities</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.coreTeam.map((member, index) => (
                <TeamMemberCard key={index} member={member} size="small" />
              ))}
            </div>
          </div>
        </section>

        {/* Join Team CTA */}
        <section className="bg-gradient-to-r from-[#a855f7]/10 via-[#6366f1]/10 to-[#22d3ee]/10 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Want to Join the Team?
              </h2>
              <p className="mb-6 text-muted-foreground">
                We are always looking for passionate individuals to join our core team. If you have skills in development, design, or community management, we would love to hear from you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#a855f7] to-[#6366f1] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
