"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Trophy, Lightbulb, Award } from "lucide-react"

type Highlight = {
  id: string
  title: string
  caption: string
  icon: React.ElementType
  image?: string
  date?: string
}

const highlights: Highlight[] = [
  {
    id: "1",
    title: "Events",
    caption: "Workshops, hackathons, and guest talks. Stay tuned for the next one.",
    icon: Calendar,
    date: "Ongoing",
  },
  {
    id: "2",
    title: "Wins",
    caption: "Hackathon wins, design awards, and project showcases from our members.",
    icon: Trophy,
    date: "2024",
  },
  {
    id: "3",
    title: "Workshops",
    caption: "Hands-on sessions on mobile, web, UI/UX, and branding.",
    icon: Lightbulb,
    date: "Weekly",
  },
  {
    id: "4",
    title: "Achievements",
    caption: "Placements, internships, and open-source contributions.",
    icon: Award,
    date: "2024",
  },
]

export function StoryHighlights() {
  const [openId, setOpenId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selected = highlights.find((h) => h.id === openId)

  return (
    <section className="border-y border-border/50 bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Story Highlights
          </p>
          <p className="text-xs text-muted-foreground">
            Click to see more
          </p>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin md:gap-6"
          style={{ scrollbarWidth: "thin" }}
        >
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => setOpenId(item.id)}
                className="flex shrink-0 flex-col items-center gap-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow md:h-24 md:w-24">
                  <Icon className="h-8 w-8 text-primary md:h-10 md:w-10" />
                </div>
                <span className="max-w-[5rem] truncate text-center text-xs font-medium text-foreground md:max-w-[6rem]">
                  {item.title}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
          <DialogContent className="sm:max-w-md">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = selected.icon
                      return <Icon className="h-5 w-5 text-primary" />
                    })()}
                    {selected.title}
                  </DialogTitle>
                </DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 text-muted-foreground"
                >
                  {selected.date && (
                    <p className="text-sm font-medium text-primary">{selected.date}</p>
                  )}
                  <p className="text-pretty">{selected.caption}</p>
                </motion.div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </section>
  )
}
