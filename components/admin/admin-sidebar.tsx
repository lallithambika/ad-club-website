"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdmin } from "@/lib/admin-context"
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Users,
  Megaphone,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/team", label: "Team Members", icon: Users },
  { href: "/admin/blog", label: "Blog", icon: Megaphone },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, messages } = useAdmin()
  const [isOpen, setIsOpen] = useState(false)
  const unreadMessages = messages.filter((m) => !m.isRead).length

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="AD Club" width={40} height={40} className="rounded-lg" priority loading="eager" />
          <div>
            <h1 className="font-bold text-foreground">AD Club</h1>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.label === "Contact Messages" && unreadMessages > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {unreadMessages}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={async () => {
            await logout()
            window.location.href = "/"
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-full w-64 bg-card border-r border-border flex-col">
        <NavContent />
      </aside>
    </>
  )
}
