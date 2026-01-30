"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Mail, Instagram, Linkedin, Github, Twitter, Moon, Lock } from "lucide-react"

const defaultFormData = {
  clubEmail: "",
  instagramLink: "",
  linkedinLink: "",
  githubLink: "",
  twitterLink: "",
  darkMode: false,
}

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useAdmin()
  const [formData, setFormData] = useState(() => settings ?? defaultFormData)
  const safeFormData = formData ?? defaultFormData
  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleSaveGeneral = async () => {
    if (!safeFormData) return
    const result = await updateSettings(safeFormData)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to save settings")
      return
    }
    toast.success("Settings saved successfully")
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields")
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match")
      return
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    // Mock password change - in real app this would call an API
    toast.success("Password changed successfully")
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <AdminShell>
      <AdminHeader title="Settings" description="Manage your dashboard preferences" />

      <div className="grid gap-6 max-w-2xl">
        {/* General Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">General Settings</CardTitle>
            <CardDescription>Update club contact information and social links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Club Email
              </Label>
              <Input
                id="email"
                type="email"
                value={safeFormData.clubEmail}
                onChange={(e) => setFormData({ ...safeFormData, clubEmail: e.target.value })}
                placeholder="adclub@college.edu"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">Social Links</Label>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={safeFormData.instagramLink}
                    onChange={(e) => setFormData({ ...safeFormData, instagramLink: e.target.value })}
                    placeholder="Instagram URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={safeFormData.linkedinLink}
                    onChange={(e) => setFormData({ ...safeFormData, linkedinLink: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={safeFormData.githubLink}
                    onChange={(e) => setFormData({ ...safeFormData, githubLink: e.target.value })}
                    placeholder="GitHub URL"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={safeFormData.twitterLink}
                    onChange={(e) => setFormData({ ...safeFormData, twitterLink: e.target.value })}
                    placeholder="Twitter URL"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveGeneral}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the dashboard appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark mode for the dashboard</p>
              </div>
              <Switch
                checked={safeFormData.darkMode}
                onCheckedChange={async (checked) => {
                  setFormData({ ...safeFormData, darkMode: checked })
                  await updateSettings({ darkMode: checked })
                  document.documentElement.classList.toggle("dark", checked)
                  toast.success(`Dark mode ${checked ? "enabled" : "disabled"}`)
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your admin password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleChangePassword} variant="outline">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
