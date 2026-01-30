"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PenLine, Palette, Users, Sparkles } from "lucide-react"

const badges = [
  { icon: PenLine, label: "Writer", color: "from-primary to-primary/70" },
  { icon: Palette, label: "Designer", color: "from-accent to-accent/70" },
  { icon: Users, label: "Mentor", color: "from-secondary to-secondary/70" },
  { icon: Sparkles, label: "Creator", color: "from-amber-500 to-orange-500" },
]

export function Gamification() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Gamification
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Earn Badges. Get Recognized.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Top contributors, member of the month, and badges for writers, designers, mentors & creators.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="w-36 border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-glow">
                  <CardContent className="flex flex-col items-center gap-2 p-6">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-white shadow-lg`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            Leaderboard & Member of the Month coming soon
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Stay active, contribute, and climb the ranks.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
