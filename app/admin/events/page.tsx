"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { Event } from "@/lib/admin-data"

type EventFormData = Omit<Event, "id" | "createdAt">

const initialFormData: EventFormData = {
  name: "",
  date: "",
  category: "Workshop",
  status: "Upcoming",
  description: "",
  posterUrl: "",
}

export default function AdminEventsPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useAdmin()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [formData, setFormData] = useState<EventFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openAddDialog = () => {
    setEditingEvent(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      date: event.date,
      category: event.category,
      status: event.status,
      description: event.description,
      posterUrl: event.posterUrl || "",
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingEventId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.date) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsSaving(true)
    const result = editingEvent
      ? await updateEvent(editingEvent.id, formData)
      : await addEvent(formData)
    setIsSaving(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to save event")
      return
    }
    toast.success(editingEvent ? "Event updated successfully" : "Event added successfully")
    setIsDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingEventId) return
    setIsDeleting(true)
    const result = await deleteEvent(deletingEventId)
    setIsDeleting(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to delete event")
      return
    }
    toast.success("Event deleted successfully")
    setIsDeleteDialogOpen(false)
    setDeletingEventId(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Workshop":
        return "bg-primary/10 text-primary"
      case "Hackathon":
        return "bg-secondary/10 text-secondary"
      case "Guest Lecture":
        return "bg-accent/10 text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <AdminHeader title="Events" description="Manage club events and workshops" />
        <Button onClick={openAddDialog} className="self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events yet. Add your first event!</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{event.name}</h3>
                      <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                      <Badge
                        variant={event.status === "Upcoming" ? "default" : "secondary"}
                        className={
                          event.status === "Upcoming"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {event.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(event)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => openDeleteDialog(event.id)}
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
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update the event details below." : "Fill in the details for the new event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Flutter Workshop"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as Event["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Guest Lecture">Guest Lecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as Event["status"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="posterUrl">Poster URL (optional)</Label>
              <Input
                id="posterUrl"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving…" : editingEvent ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        isLoading={isDeleting}
      />
    </AdminShell>
  )
}
