import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { StoryHighlights } from "@/components/home/story-highlights"
import { AboutPreview } from "@/components/home/about-preview"
import { BlogPreview } from "@/components/home/blog-preview"
import { EventsCountdown } from "@/components/home/events-countdown"
import { WhatWeDo } from "@/components/home/what-we-do"
import { StudentValueHub } from "@/components/home/student-value-hub"
import { Gamification } from "@/components/home/gamification"
import { ProjectShowcase } from "@/components/home/project-showcase"
import { Highlights } from "@/components/home/highlights"
import { FAB } from "@/components/home/fab"
import { SetupBanner } from "@/components/setup-banner"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <SetupBanner />
        <HeroSection />
        <StoryHighlights />
        <AboutPreview />
        <BlogPreview />
        <EventsCountdown />
        <WhatWeDo />
        <StudentValueHub />
        <Gamification />
        <ProjectShowcase />
        <Highlights />
      </main>
      <Footer />
      <FAB />
    </div>
  )
}
