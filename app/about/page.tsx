import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Target, Eye, Lightbulb, Code, Palette, Server, Cloud, Smartphone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const technologies = [
  { icon: Smartphone, name: "Android", description: "Native Android development with Kotlin and Java" },
  { icon: Code, name: "Web Development", description: "React, Next.js, Vue.js, and modern JavaScript" },
  { icon: Server, name: "Backend", description: "Node.js, Python, Express, and Django" },
  { icon: Palette, name: "UI/UX", description: "Figma, Adobe XD, and design thinking" },
  { icon: Cloud, name: "Cloud & APIs", description: "AWS, Firebase, and RESTful API design" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#a855f7]/5 via-[#6366f1]/5 to-[#22d3ee]/5 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">About Us</p>
              <h1 className="text-balance text-4xl font-bold text-foreground md:text-5xl">
                Our Story & Mission
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Discover the passion and purpose behind Arena App Development Club
              </p>
            </div>
          </div>
        </section>

        {/* Club Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-pretty">
                  Arena App Development Club was founded in 2023 by a group of passionate students who saw the need for a community that bridges the gap between classroom learning and real-world application development. What started as a small group of enthusiasts has grown into a thriving community of developers, designers, and innovators.
                </p>
                <p className="text-pretty">
                  We believe that every student has the potential to become a skilled developer, and our role is to provide the resources, mentorship, and opportunities to make that happen. Through workshops, hackathons, and collaborative projects, we have helped dozens of students take their first steps into the world of professional app development.
                </p>
                <p className="text-pretty">
                  Today, AD Club stands as a testament to what students can achieve when they come together with a shared vision. Our members have gone on to intern at top tech companies, launch their own startups, and contribute to open-source projects that impact thousands of users worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Vision */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#a855f7]/10 to-[#6366f1]/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-pretty text-muted-foreground">
                    To become the premier student-led technical community that produces industry-ready developers and innovators. We envision a future where every member of AD Club contributes to building technology that solves real-world problems and makes a positive impact on society.
                  </p>
                </CardContent>
              </Card>

              {/* Mission */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1]/10 to-[#22d3ee]/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>Foster innovation and creativity in app development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>Provide hands-on learning experiences with modern technologies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>Build a supportive community of like-minded developers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>Connect students with industry experts and opportunities</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Our Expertise</p>
              <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
                Technologies We Work With
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {technologies.map((tech, index) => (
                <Card 
                  key={index} 
                  className="group border-border/50 bg-card text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7]/10 to-[#22d3ee]/10 text-primary transition-colors group-hover:from-[#a855f7]/20 group-hover:to-[#22d3ee]/20">
                      <tech.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{tech.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
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
