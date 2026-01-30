"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Users, Linkedin, Github } from "lucide-react"
import { toast } from "sonner"
import type { TeamMember } from "@/lib/admin-data"

type TeamMemberFormData = Omit<TeamMember, "id" | "createdAt">

const initialFormData: TeamMemberFormData = {
  name: "",
  role: "",
  roleCategory: "Core Team",
  profileImage: "",
  linkedinLink: "",
  githubLink: "",
}

export default function AdminTeamPage() {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useAdmin()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TeamMemberFormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openAddDialog = () => {
    setEditingMember(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      roleCategory: member.roleCategory,
      profileImage: member.profileImage || "",
      linkedinLink: member.linkedinLink || "",
      githubLink: member.githubLink || "",
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingMemberId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast.error("Please fill in all required fields")
      return
    }
    setIsSaving(true)
    const result = editingMember
      ? await updateTeamMember(editingMember.id, formData)
      : await addTeamMember(formData)
    setIsSaving(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to save team member")
      return
    }
    toast.success(editingMember ? "Team member updated successfully" : "Team member added successfully")
    setIsDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingMemberId) return
    setIsDeleting(true)
    const result = await deleteTeamMember(deletingMemberId)
    setIsDeleting(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to remove team member")
      return
    }
    toast.success("Team member removed successfully")
    setIsDeleteDialogOpen(false)
    setDeletingMemberId(null)
  }

  const groupedMembers = {
    Faculty: teamMembers.filter((m) => m.roleCategory === "Faculty"),
    Lead: teamMembers.filter((m) => m.roleCategory === "Lead"),
    "Domain Lead": teamMembers.filter((m) => m.roleCategory === "Domain Lead"),
    "Core Team": teamMembers.filter((m) => m.roleCategory === "Core Team"),
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Faculty":
        return "bg-primary/10 text-primary"
      case "Lead":
        return "bg-secondary/10 text-secondary"
      case "Domain Lead":
        return "bg-accent/10 text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <AdminHeader title="Team Members" description="Manage club team and members" />
        <Button onClick={openAddDialog} className="self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No team members yet. Add your first member!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMembers).map(
            ([category, members]) =>
              members.length > 0 && (
                <Card key={category} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                      {category}
                      <Badge variant="secondary" className="text-xs">
                        {members.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profileImage || "/placeholder.svg"} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.linkedinLink && (
                              <a
                                href={member.linkedinLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                            {member.githubLink && (
                              <a
                                href={member.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
            <DialogDescription>
              {editingMember ? "Update the member details below." : "Fill in the details for the new member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Web Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roleCategory">Category</Label>
                <Select
                  value={formData.roleCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roleCategory: value as TeamMember["roleCategory"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Domain Lead">Domain Lead</SelectItem>
                    <SelectItem value="Core Team">Core Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileImage">Profile Image URL (optional)</Label>
              <Input
                id="profileImage"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedinLink">LinkedIn URL (optional)</Label>
              <Input
                id="linkedinLink"
                value={formData.linkedinLink}
                onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubLink">GitHub URL (optional)</Label>
              <Input
                id="githubLink"
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving…" : editingMember ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member? This action cannot be undone."
        isLoading={isDeleting}
      />
    </AdminShell>
  )
}
