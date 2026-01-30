"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-accent/10 shadow-glow transition-all duration-300 hover:border-primary/30">
              <Image
                src="/logo.jpeg"
                alt="AD Club"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-xl border border-border bg-card p-4 shadow-glow">
              <p className="text-2xl font-bold text-primary">Est. 2023</p>
              <p className="text-sm text-muted-foreground">Building the future</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                About Us
              </p>
              <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
                Empowering Student Developers
              </h2>
            </div>
            
            <p className="text-pretty text-muted-foreground">
              Arena App Development Club (AD Club) is a student-led technical community dedicated to fostering innovation and skill development in app development. We bring together passionate students who are eager to learn, collaborate, and build real-world applications.
            </p>
            
            <p className="text-pretty text-muted-foreground">
              Our mission is to bridge the gap between academic learning and industry requirements by providing hands-on experience with modern technologies, mentorship from experienced developers, and opportunities to work on impactful projects.
            </p>

            <Button
              asChild
              variant="outline"
              className="gap-2 bg-transparent transition-all duration-200 hover:border-primary/50 hover:shadow-glow"
            >
              <Link href="/about">
                Learn More About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
