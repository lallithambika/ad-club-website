"use client"

import React, { useState } from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, MapPin, Phone, Send, Github, Linkedin, Instagram, Twitter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    description: "adclub@arena.edu",
    href: "mailto:adclub@arena.edu",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Arena College of Engineering & Technology, Tech Park Road, Bangalore - 560001",
    href: "#",
  },
]

const socialLinks = [
  { href: "#", icon: Github, label: "GitHub", color: "hover:text-foreground" },
  { href: "#", icon: Linkedin, label: "LinkedIn", color: "hover:text-[#0077b5]" },
  { href: "#", icon: Instagram, label: "Instagram", color: "hover:text-[#e4405f]" },
  { href: "#", icon: Twitter, label: "Twitter", color: "hover:text-[#1da1f2]" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from("contact_messages").insert({
      name: formData.name,
      email: formData.email,
      subject: formData.subject || null,
      message: formData.message,
    })

    setIsSubmitting(false)

    if (error) {
      console.error("[contact] Submit error:", error)
      toast.error(error.message ?? "Failed to send message. Please try again.")
      return
    }

    setIsSubmitted(true)
    toast.success("Message sent successfully")
    setFormData({ name: "", email: "", subject: "", message: "" })

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#a855f7]/5 via-[#6366f1]/5 to-[#22d3ee]/5 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
              <h1 className="text-balance text-4xl font-bold text-foreground md:text-5xl">
                Get in Touch
              </h1>
              <p className="mt-4 text-pretty text-lg text-muted-foreground">
                Have questions or want to join the club? We would love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we will get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="rounded-lg bg-green-500/10 p-6 text-center">
                      <div className="mb-2 text-lg font-semibold text-green-600">Message Sent!</div>
                      <p className="text-sm text-muted-foreground">
                        Thank you for reaching out. We will get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What's this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Your message..."
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gap-2 bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white hover:opacity-90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info & Map */}
              <div className="space-y-6">
                {/* Contact Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#a855f7]/10 to-[#22d3ee]/10">
                          <info.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{info.title}</h3>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Social Links */}
                <Card className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Follow Us</CardTitle>
                    <CardDescription>Stay connected on social media</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {socialLinks.map((social) => (
                        <Link
                          key={social.label}
                          href={social.href}
                          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors ${social.color}`}
                          aria-label={social.label}
                        >
                          <social.icon className="h-5 w-5" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Map Placeholder */}
                <Card className="overflow-hidden border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Our Location</CardTitle>
                    <CardDescription>Find us on campus</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative aspect-video w-full bg-gradient-to-br from-[#a855f7]/10 to-[#22d3ee]/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="mx-auto mb-2 h-12 w-12 text-primary/40" />
                          <p className="text-sm text-muted-foreground">
                            Arena College of Engineering & Technology
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tech Park Road, Bangalore
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section className="bg-gradient-to-r from-[#a855f7]/10 via-[#6366f1]/10 to-[#22d3ee]/10 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Ready to Join AD Club?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Become part of a thriving community of student developers. Learn, build, and grow with us.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#a855f7] to-[#6366f1] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
                >
                  Explore Events
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
