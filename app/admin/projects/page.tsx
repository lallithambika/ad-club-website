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
import { Plus, Pencil, Trash2, FolderKanban, Github, Users } from "lucide-react"
import { toast } from "sonner"
import type { Project } from "@/lib/admin-data"

type ProjectFormData = Omit<Project, "id" | "createdAt">

const initialFormData: ProjectFormData = {
  name: "",
  description: "",
  techStack: [],
  teamSize: 1,
  githubLink: "",
  category: "Web",
}

export default function AdminProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useAdmin()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData)
  const [techInput, setTechInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openAddDialog = () => {
    setEditingProject(null)
    setFormData(initialFormData)
    setTechInput("")
    setIsDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      teamSize: project.teamSize,
      githubLink: project.githubLink,
      category: project.category,
    })
    setTechInput(project.techStack.join(", "))
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingProjectId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    const techStack = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)

    const projectData = { ...formData, techStack }
    setIsSaving(true)
    const result = editingProject
      ? await updateProject(editingProject.id, projectData)
      : await addProject(projectData)
    setIsSaving(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to save project")
      return
    }
    toast.success(editingProject ? "Project updated successfully" : "Project added successfully")
    setIsDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingProjectId) return
    setIsDeleting(true)
    const result = await deleteProject(deletingProjectId)
    setIsDeleting(false)
    if (!result.ok) {
      toast.error(result.error ?? "Failed to delete project")
      return
    }
    toast.success("Project deleted successfully")
    setIsDeleteDialogOpen(false)
    setDeletingProjectId(null)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Web":
        return "bg-primary/10 text-primary"
      case "Mobile":
        return "bg-secondary/10 text-secondary"
      case "Internal":
        return "bg-accent/10 text-accent-foreground"
      case "Community":
        return "bg-green-100 text-green-700"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <AdminHeader title="Projects" description="Manage club projects and repositories" />
        <Button onClick={openAddDialog} className="self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No projects yet. Add your first project!</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.teamSize} members
                      </span>
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => openDeleteDialog(project.id)}
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
            <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update the project details below." : "Fill in the details for the new project."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Campus Connect App"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as Project["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  min="1"
                  value={formData.teamSize}
                  onChange={(e) =>
                    setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
              <Input
                id="techStack"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="React, Node.js, Firebase"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubLink">GitHub Link</Label>
              <Input
                id="githubLink"
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                placeholder="https://github.com/adclub/project"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving…" : editingProject ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={isDeleting}
      />
    </AdminShell>
  )
}
