"use client"

import { motion } from "framer-motion"
import { Smartphone, Globe, Palette, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Learn to build native and cross-platform mobile applications using Flutter, React Native, and Kotlin.",
  },
  {
    icon: Globe,
    title: "Web Development",
    description: "Master modern web technologies including React, Next.js, Node.js, and cloud deployment strategies.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Design intuitive user interfaces and create engaging user experiences using industry-standard tools.",
  },
  {
    icon: Trophy,
    title: "Hackathons & Workshops",
    description: "Participate in coding competitions, hackathons, and hands-on workshops to sharpen your skills.",
  },
]

export function WhatWeDo() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">What We Do</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Building Skills for the Future
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            We focus on practical, hands-on learning experiences that prepare students for real-world challenges in the tech industry.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <Card className="group border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
