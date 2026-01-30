"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const REDIRECT_TIMEOUT_MS = 10000

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAdmin()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return
    if (isLoading) return

    hasRedirected.current = true
    if (isAuthenticated) {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/admin/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (hasRedirected.current) return
      hasRedirected.current = true
      router.replace("/admin/login")
    }, REDIRECT_TIMEOUT_MS)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
