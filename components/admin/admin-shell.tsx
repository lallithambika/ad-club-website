"use client"

import type React from "react"
import { useAdmin } from "@/lib/admin-context"
import { AdminSidebar } from "./admin-sidebar"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const LOAD_TIMEOUT_MS = 10000

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const { isAuthenticated, isLoading } = useAdmin()
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/admin/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false)
      return
    }
    const t = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [isLoading])

  if (isLoading && !timedOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (timedOut && isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <div className="text-center space-y-2">
          <p className="font-medium text-foreground">Loading took too long</p>
          <p className="text-sm text-muted-foreground">
            There may be a connection or configuration issue. Try again or sign in.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.replace("/admin/login")}>
            Go to Login
          </Button>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-h-screen px-4 pb-8 pt-16 lg:pl-64 lg:pt-8 lg:px-8 lg:pb-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
