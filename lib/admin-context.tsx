"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Event,
  Project,
  TeamMember,
  Announcement,
  ContactMessage,
  Settings,
} from "./admin-data"

interface AdminUser {
  id: string
  email: string | null
  name: string | null
}

interface AdminContextType {
  // Auth
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>

  // Events
  events: Event[]
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<{ ok: boolean; error?: string }>
  updateEvent: (id: string, event: Partial<Event>) => Promise<{ ok: boolean; error?: string }>
  deleteEvent: (id: string) => Promise<{ ok: boolean; error?: string }>

  // Projects
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt">) => Promise<{ ok: boolean; error?: string }>
  updateProject: (id: string, project: Partial<Project>) => Promise<{ ok: boolean; error?: string }>
  deleteProject: (id: string) => Promise<{ ok: boolean; error?: string }>

  // Team Members
  teamMembers: TeamMember[]
  addTeamMember: (member: Omit<TeamMember, "id" | "createdAt">) => Promise<{ ok: boolean; error?: string }>
  updateTeamMember: (id: string, member: Partial<TeamMember>) => Promise<{ ok: boolean; error?: string }>
  deleteTeamMember: (id: string) => Promise<{ ok: boolean; error?: string }>

  // Announcements
  announcements: Announcement[]
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => void
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void
  deleteAnnouncement: (id: string) => void

  // Messages
  messages: ContactMessage[]
  markMessageAsRead: (id: string) => Promise<{ ok: boolean; error?: string }>

  // Settings
  settings: Settings | null
  updateSettings: (settings: Partial<Settings>) => Promise<{ ok: boolean; error?: string }>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Initialize auth state and load admin data - always resolves loading
  useEffect(() => {
    const LOAD_TIMEOUT_MS = 8000

    const init = async () => {
      setIsLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setUser(null)
          return
        }

        const { data: adminProfile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("name, email, role")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError || !adminProfile || !["admin", "super_admin"].includes(adminProfile.role)) {
          if (profileError) {
            console.error("[admin-context] Error fetching admin profile:", profileError.message)
          }
          await supabase.auth.signOut()
          setUser(null)
          return
        }

        setUser({
          id: user.id,
          email: user.email,
          name: adminProfile.name ?? user.email,
        })

        // Load dashboard data (non-blocking for auth; failures don't block loading)
        const [eventsRes, projectsRes, teamRes, messagesRes, settingsRes] = await Promise.all([
          supabase.from("events").select("*").order("date", { ascending: false }),
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase.from("team_members").select("*").order("display_order", { ascending: true }),
          supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
          supabase.from("settings").select("*").limit(1).maybeSingle(),
        ])

        if (!eventsRes.error && eventsRes.data) {
          setEvents(
            eventsRes.data.map((e: any) => ({
              id: e.id,
              name: e.title,
              date: e.date,
              category: e.category,
              status: e.status === "upcoming" ? "Upcoming" : "Completed",
              description: e.description ?? "",
              posterUrl: e.image_url ?? undefined,
              createdAt: e.created_at,
            }))
          )
        }
        if (!projectsRes.error && projectsRes.data) {
          setProjects(
            projectsRes.data.map((p: any) => ({
              id: p.id,
              name: p.title,
              description: p.description ?? "",
              techStack: (p.tech_stack as string[]) ?? [],
              teamSize: p.team_size ?? 1,
              githubLink: p.github_url ?? "",
              category: p.category === "web" ? "Web" : p.category === "mobile" ? "Mobile" : "Internal",
              createdAt: p.created_at,
            }))
          )
        }
        if (!teamRes.error && teamRes.data) {
          setTeamMembers(
            teamRes.data.map((m: any) => ({
              id: m.id,
              name: m.name,
              role: m.position ?? m.role,
              roleCategory:
                m.role === "faculty"
                  ? "Faculty"
                  : m.role === "lead"
                    ? "Lead"
                    : m.role === "domain-lead"
                      ? "Domain Lead"
                      : "Core Team",
              profileImage: m.image_url ?? undefined,
              linkedinLink: m.linkedin_url ?? undefined,
              githubLink: m.github_url ?? undefined,
              createdAt: m.created_at,
            }))
          )
        }
        if (!messagesRes.error && messagesRes.data) {
          setMessages(
            messagesRes.data.map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              message: m.message,
              date: m.created_at,
              isRead: m.is_read,
            }))
          )
        }
        if (!settingsRes.error && settingsRes.data) {
          setSettings({
            clubEmail: settingsRes.data.club_email ?? "",
            instagramLink: settingsRes.data.instagram_url ?? "",
            linkedinLink: settingsRes.data.linkedin_url ?? "",
            githubLink: settingsRes.data.github_url ?? "",
            twitterLink: settingsRes.data.twitter_url ?? "",
            darkMode: false,
          })
        } else {
          setSettings({
            clubEmail: "",
            instagramLink: "",
            linkedinLink: "",
            githubLink: "",
            twitterLink: "",
            darkMode: false,
          })
        }
      } catch (err) {
        console.error("[admin-context] Unexpected error:", err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
          console.warn("[admin-context] Init timeout - forcing loading=false")
          return false
        }
        return prev
      })
    }, LOAD_TIMEOUT_MS)

    void init().then(() => clearTimeout(timeoutId))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null)
        return
      }
      try {
        const { data: adminProfile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("name, email, role")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileError || !adminProfile || !["admin", "super_admin"].includes(adminProfile.role)) {
          await supabase.auth.signOut()
          setUser(null)
          return
        }
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: adminProfile.name ?? session.user.email,
        })
      } catch {
        setUser(null)
      }
    })

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase])


  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Event functions (via API with service role to avoid RLS permission errors)
  const addEvent = async (event: Omit<Event, "id" | "createdAt">): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] addEvent error:", json.error)
      return { ok: false, error: json.error ?? "Failed to add event" }
    }
    if (json.data) {
      setEvents((prev) => [json.data as Event, ...prev])
    }
    return { ok: true }
  }

  const updateEvent = async (id: string, event: Partial<Event>): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...event }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] updateEvent error:", json.error)
      return { ok: false, error: json.error ?? "Failed to update event" }
    }
    if (json.data) {
      setEvents((prev) => prev.map((e) => (e.id === id ? (json.data as Event) : e)))
    } else {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...event } : e)))
    }
    return { ok: true }
  }

  const deleteEvent = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] deleteEvent error:", json.error)
      return { ok: false, error: json.error ?? "Failed to delete event" }
    }
    setEvents((prev) => prev.filter((e) => e.id !== id))
    return { ok: true }
  }

  // Project functions (via API with service role)
  const addProject = async (project: Omit<Project, "id" | "createdAt">): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] addProject error:", json.error)
      return { ok: false, error: json.error ?? "Failed to add project" }
    }
    if (json.data) {
      setProjects((prev) => [json.data as Project, ...prev])
    }
    return { ok: true }
  }

  const updateProject = async (id: string, project: Partial<Project>): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...project }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] updateProject error:", json.error)
      return { ok: false, error: json.error ?? "Failed to update project" }
    }
    if (json.data) {
      setProjects((prev) => prev.map((p) => (p.id === id ? (json.data as Project) : p)))
    } else {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...project } : p)))
    }
    return { ok: true }
  }

  const deleteProject = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] deleteProject error:", json.error)
      return { ok: false, error: json.error ?? "Failed to delete project" }
    }
    setProjects((prev) => prev.filter((p) => p.id !== id))
    return { ok: true }
  }

  // Team Member functions (via API with service role)
  const addTeamMember = async (member: Omit<TeamMember, "id" | "createdAt">): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/team-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] addTeamMember error:", json.error)
      return { ok: false, error: json.error ?? "Failed to add team member" }
    }
    if (json.data) {
      setTeamMembers((prev) => [json.data as TeamMember, ...prev])
    }
    return { ok: true }
  }

  const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/team-members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...member }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] updateTeamMember error:", json.error)
      return { ok: false, error: json.error ?? "Failed to update team member" }
    }
    if (json.data) {
      setTeamMembers((prev) => prev.map((m) => (m.id === id ? (json.data as TeamMember) : m)))
    } else {
      setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)))
    }
    return { ok: true }
  }

  const deleteTeamMember = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch(`/api/admin/team-members?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] deleteTeamMember error:", json.error)
      return { ok: false, error: json.error ?? "Failed to delete team member" }
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
    return { ok: true }
  }

  // Announcement functions
  const addAnnouncement = (announcement: Omit<Announcement, "id" | "createdAt">) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setAnnouncements((prev) => [newAnnouncement, ...prev])
  }

  const updateAnnouncement = (id: string, announcement: Partial<Announcement>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...announcement } : a)))
  }

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  // Message functions (via API with service role)
  const markMessageAsRead = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin-context] markMessageAsRead error:", json.error)
      return { ok: false, error: json.error ?? "Failed to mark message as read" }
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
    return { ok: true }
  }

  // Settings: persist via API (service role) to avoid "permission denied for table users" with anon RLS
  const updateSettings = async (newSettings: Partial<Settings>): Promise<{ ok: boolean; error?: string }> => {
    const payload: Record<string, unknown> = {}
    if (newSettings.clubEmail !== undefined) payload.clubEmail = newSettings.clubEmail
    if (newSettings.instagramLink !== undefined) payload.instagramLink = newSettings.instagramLink
    if (newSettings.linkedinLink !== undefined) payload.linkedinLink = newSettings.linkedinLink
    if (newSettings.githubLink !== undefined) payload.githubLink = newSettings.githubLink
    if (newSettings.twitterLink !== undefined) payload.twitterLink = newSettings.twitterLink

    if (Object.keys(payload).length === 0) {
      setSettings((prev) => (prev ? { ...prev, ...newSettings } : (newSettings as Settings)))
      return { ok: true }
    }

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    if (!json.ok) {
      return { ok: false, error: json.error ?? "Failed to save settings" }
    }
    if (json.data) {
      setSettings({
        ...json.data,
        darkMode: settings?.darkMode ?? false,
      })
    } else {
      setSettings((prev) => (prev ? { ...prev, ...newSettings } : (newSettings as Settings)))
    }
    return { ok: true }
  }

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        projects,
        addProject,
        updateProject,
        deleteProject,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        messages,
        markMessageAsRead,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
