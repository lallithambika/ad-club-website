"use client"

import { useEffect, useRef, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Calendar,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type AdminPost = {
  id: string
  title: string
  content: string
  tags: string[] | null
  featured: boolean
  status: "draft" | "published"
  cover_image_url: string | null
  created_at: string
}

type PostForm = {
  title: string
  content: string
  tags: string
  status: "draft" | "published"
  featured: boolean
  coverImageUrl: string
}

const emptyForm: PostForm = {
  title: "",
  content: "",
  tags: "",
  status: "draft",
  featured: false,
  coverImageUrl: "",
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const supabase = createClient()

  const loadPosts = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to load blog posts", JSON.stringify(error, null, 2))
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setLoadError("Blog posts table not found. Run scripts/003_complete_setup.sql in Supabase.")
        } else if (error.code === "42501" || error.message?.includes("permission denied")) {
          setLoadError("Permission denied. Check your RLS policies in Supabase.")
        } else {
          setLoadError(error.message || "Failed to load blog posts")
        }
        setPosts([])
        return
      }
      setPosts((data ?? []) as AdminPost[])
    } catch (err) {
      console.error("Unexpected error loading blog posts", err)
      setLoadError("An unexpected error occurred. Try again.")
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openNewDialog = () => {
    setEditingPost(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setDialogOpen(true)
  }

  const openEditDialog = (post: AdminPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      content: post.content,
      tags: (post.tags ?? []).join(", "),
      status: post.status,
      featured: post.featured,
      coverImageUrl: post.cover_image_url ?? "",
    })
    setImageFile(null)
    setImagePreview(post.cover_image_url)
    setDialogOpen(true)
  }

  const handleImageChange = (file: File | null) => {
    if (!file) return
    setImageFile(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file)
    } else {
      toast.error("Please drop an image file")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const BUCKET_NAME = "blog-images"

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    // If editing and no new file selected, keep existing URL
    if (!imageFile && form.coverImageUrl) {
      return form.coverImageUrl
    }

    // Image is optional: allow saving without image (cover_image_url will be null)
    if (!imageFile) {
      return null
    }

    setIsUploadingImage(true)

    try {
      const fileExt = imageFile.name.split(".").pop()
      const filePath = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, imageFile)

      if (uploadError) {
        console.error("Failed to upload image", uploadError)
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("does not exist")) {
          toast.error(
            'Storage bucket "blog-images" not found. Run scripts/004_storage_blog_images.sql in Supabase SQL Editor to create it.',
            { duration: 8000 }
          )
        } else if (uploadError.message?.includes("permission denied") || uploadError.message?.includes("new row violates")) {
          toast.error(
            "Permission denied. Check Storage bucket policies (run 004_storage_blog_images.sql).",
            { duration: 8000 }
          )
        } else {
          toast.error(`Failed to upload image: ${uploadError.message || "Unknown error"}`)
        }
        setIsUploadingImage(false)
        return null
      }

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

      setIsUploadingImage(false)

      if (!publicUrlData?.publicUrl) {
        toast.error("Could not get image URL")
        return null
      }

      return publicUrlData.publicUrl
    } catch (err) {
      console.error("Unexpected error uploading image", err)
      toast.error("An unexpected error occurred while uploading the image")
      setIsUploadingImage(false)
      return null
    }
  }

  const handleSave = async (targetStatus: "draft" | "published") => {
    if (!form.content) {
      toast.error("Caption is required")
      return
    }

    setIsSaving(true)

    const imageUrl = await uploadImageIfNeeded()
    if (imageUrl === null && imageFile) {
      setIsSaving(false)
      return
    }

    const payload = {
      title: form.title || null,
      content: form.content,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
      status: targetStatus,
      featured: form.featured,
      cover_image_url: imageUrl ?? null,
    }

    if (editingPost) {
      const res = await fetch("/api/admin/blog-posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPost.id, ...payload }),
      })
      const json = await res.json()
      if (!json.ok) {
        console.error("[admin/blog] update post error:", json.error)
        toast.error(json.error ?? "Failed to update post")
        setIsSaving(false)
        return
      }
      if (json.data) {
        setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? (json.data as AdminPost) : p)))
      }
      toast.success(targetStatus === "published" ? "Post updated & shared" : "Post updated")
    } else {
      const res = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.ok) {
        console.error("[admin/blog] create post error:", json.error)
        toast.error(json.error ?? "Failed to create post")
        setIsSaving(false)
        return
      }
      if (json.data) {
        setPosts((prev) => [json.data as AdminPost, ...prev])
      }
      toast.success(targetStatus === "published" ? "Post shared" : "Draft saved")
    }

    setIsSaving(false)
    setDialogOpen(false)
  }

  const openDeleteDialog = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const res = await fetch(`/api/admin/blog-posts?id=${encodeURIComponent(deletingId)}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.ok) {
      console.error("[admin/blog] delete post error:", json.error)
      toast.error(json.error ?? "Failed to delete post")
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== deletingId))
    toast.success("Post deleted")
    setDeleteDialogOpen(false)
    setDeletingId(null)
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <AdminHeader
          title="Blog"
          description="Create, edit, and publish blog posts for the public site."
        />
        <Button onClick={openNewDialog} className="self-start">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Loading posts...
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card className="border-0 shadow-sm border-destructive/30">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <p className="text-sm font-medium text-destructive">{loadError}</p>
              <Button variant="outline" onClick={() => void loadPosts()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
              <FileText className="h-10 w-10" />
              <p>No posts yet. Create your first blog post.</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-0 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={post.status === "published" ? "default" : "secondary"}
                      className={
                        post.status === "published"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </Badge>
                    {post.featured && (
                      <Badge className="bg-yellow-400/20 text-yellow-600">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(post)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create Instagram-style Post"}</DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Update the post image, caption, and settings."
                : "Share moments from AD Club in an image-first format."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Image upload area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Post image</label>
              <div
                className={cn(
                  "relative flex h-64 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-2 transition hover:border-primary/60 hover:bg-muted/60",
                  (imagePreview || form.coverImageUrl) && "border-none bg-background"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {imagePreview || form.coverImageUrl ? (
                  <img
                    src={imagePreview ?? (form.coverImageUrl || "")}
                    alt="Post preview"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Drag & drop an image here</p>
                      <p className="text-xs">or click to browse files</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: square or vertical images. Max 5MB.
              </p>
            </div>

            {/* Caption & metadata */}
            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Caption
                  </label>
                  <Textarea
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Write a short story, just like Instagram captions..."
                    className="resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Optional title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="HackArena highlights, Workshop recap..."
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-muted/40 p-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hashtags
                  </label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="#hackathon #workshop #mobile"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Separate with commas or spaces. We will store them without the `#`.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-background/60 p-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Featured post</p>
                    <p className="text-[11px] text-muted-foreground">
                      Show this post more prominently on the site.
                    </p>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(val) =>
                      setForm((prev) => ({
                        ...prev,
                        featured: val,
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, status: val as "draft" | "published" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    You can also override this using the Share / Save as Draft buttons.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || isUploadingImage}
              onClick={() => handleSave("draft")}
            >
              {isSaving && form.status === "draft" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving draft...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              type="button"
              disabled={isSaving || isUploadingImage}
              onClick={() => handleSave("published")}
            >
              {isSaving && form.status === "published" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : editingPost ? (
                "Update & Share"
              ) : (
                "Share Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </AdminShell>
  )
}

