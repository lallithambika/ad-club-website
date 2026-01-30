import React from "react"
import type { Metadata } from "next"
import { AdminProviderWrapper } from "@/components/admin/admin-provider-wrapper"

export const metadata: Metadata = {
  title: "Admin Dashboard | AD Club",
  description: "Admin portal for Arena App Development Club",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviderWrapper>{children}</AdminProviderWrapper>
}
