"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Home,
  BookOpen,
  Calendar,
  FolderKanban,
  Users,
  Info,
  Mail,
  Lock,
} from "lucide-react"

const searchLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: Users },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/admin", label: "Admin", icon: Lock },
]

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    document.addEventListener("keydown", down)
    window.addEventListener("open-global-search", onOpen)
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("open-global-search", onOpen)
    }
  }, [])

  const run = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Navigate to a page. Start typing to filter."
    >
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {searchLinks.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                onSelect={() => run(item.href)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
