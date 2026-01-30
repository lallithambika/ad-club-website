"use client"

import { useEffect, useState, useRef } from "react"

const stats = [
  { value: 25, suffix: "+", label: "Events Conducted" },
  { value: 15, suffix: "+", label: "Projects Completed" },
  { value: 100, suffix: "+", label: "Active Members" },
  { value: 10, suffix: "+", label: "Industry Partners" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const duration = 2000
          const increment = value / (duration / 16)
          
          const timer = setInterval(() => {
            start += increment
            if (start >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div ref={ref} className="text-4xl font-bold text-foreground md:text-5xl">
      {count}
      <span className="text-primary">{suffix}</span>
    </div>
  )
}

export function Highlights() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Our Impact</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Growing Stronger Every Day
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group rounded-2xl border border-border/50 bg-card p-8 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
