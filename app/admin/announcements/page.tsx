"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react"
import { toast } from "sonner"
import type { Announcement } from "@/lib/admin-data"

type AnnouncementFormData = Omit<Announcement, "id" | "createdAt">

const initialFormData: AnnouncementFormData = {
  title: "",
  content: "",
  isVisible: true,
}

export default function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAdmin()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>(initialFormData)

  const openAddDialog = () => {
    setEditingAnnouncement(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isVisible: announcement.isVisible,
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingAnnouncementId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields")
      return
    }

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, formData)
      toast.success("Announcement updated successfully")
    } else {
      addAnnouncement(formData)
      toast.success("Announcement added successfully")
    }
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (deletingAnnouncementId) {
      deleteAnnouncement(deletingAnnouncementId)
      toast.success("Announcement deleted successfully")
      setIsDeleteDialogOpen(false)
      setDeletingAnnouncementId(null)
    }
  }

  const toggleVisibility = (id: string, isVisible: boolean) => {
    updateAnnouncement(id, { isVisible })
    toast.success(`Announcement ${isVisible ? "shown" : "hidden"}`)
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <AdminHeader title="Announcements" description="Manage homepage banners and announcements" />
        <Button onClick={openAddDialog} className="self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No announcements yet. Add your first announcement!</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                      <Badge
                        className={
                          announcement.isVisible
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {announcement.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground">Created: {announcement.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`visibility-${announcement.id}`} className="text-sm text-muted-foreground">
                        Show
                      </Label>
                      <Switch
                        id={`visibility-${announcement.id}`}
                        checked={announcement.isVisible}
                        onCheckedChange={(checked) => toggleVisibility(announcement.id, checked)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(announcement)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => openDeleteDialog(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update the announcement details below."
                : "Fill in the details for the new announcement."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="HackArena 2024 Registrations Open!"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Brief announcement content..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
              />
              <Label htmlFor="isVisible">Show on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingAnnouncement ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </AdminShell>
  )
}
