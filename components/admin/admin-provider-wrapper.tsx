"use client"

import React from "react"

import { AdminProvider } from "@/lib/admin-context"
import { Toaster } from "@/components/ui/toaster"

export function AdminProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
      <Toaster />
    </AdminProvider>
  )
}
