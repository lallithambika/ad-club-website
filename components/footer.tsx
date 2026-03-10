import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, Instagram, Twitter, Mail } from "lucide-react"

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
]

const socialLinks = [
  { href: "#", icon: Github, label: "GitHub" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Twitter, label: "Twitter" },
  { href: "mailto:adclub@arena.edu", icon: Mail, label: "Email" },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="AD Club Logo"
                width={48}
                height={48}
                className="rounded-lg"
                priority
                loading="eager"
              />
              <div>
                <span className="font-semibold text-foreground">Arena App Development Club</span>
                <p className="text-sm text-muted-foreground">Building real-world apps</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering student developers to build innovative applications and grow their technical skills.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect With Us</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Arena College of Engineering & Technology
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Arena App Development Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
