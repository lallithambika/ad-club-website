"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Heart, MessageCircle, Share2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type BlogPost = {
  id: string
  title: string
  content: string
  tags: string[] | null
  featured: boolean
  cover_image_url: string | null
  created_at: string
}

type BlogComment = {
  id: string
  user_name: string
  message: string
  created_at: string
}

export default function BlogPostPage() {
  const params = useParams()
  const id = params?.id as string | undefined

  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [likesCount, setLikesCount] = useState<number>(0)
  const [isLiking, setIsLiking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [anonId, setAnonId] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [commentForm, setCommentForm] = useState({ name: "", message: "" })
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const storageKey = "adclub_blog_user_id"
    let identifier = localStorage.getItem(storageKey)
    if (!identifier) {
      identifier = crypto.randomUUID()
      localStorage.setItem(storageKey, identifier)
    }
    setAnonId(identifier)
  }, [])

  useEffect(() => {
    if (!id || !anonId) return
    const supabase = createClient()

    const load = async () => {
      setIsLoading(true)
      const [
        { data: postData, error: postError },
        { data: commentsData },
        likesCountRes,
        existingLikeRes,
      ] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("id", id).single(),
        supabase
          .from("blog_comments")
          .select("id,user_name,message,created_at")
          .eq("post_id", id)
          .order("created_at", { ascending: true }),
        supabase
          .from("blog_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", id),
        supabase
          .from("blog_likes")
          .select("id")
          .eq("post_id", id)
          .eq("user_identifier", anonId)
          .maybeSingle(),
      ])

      if (postError || !postData) {
        console.error("Failed to load post", postError)
        toast.error("Post not found")
        setIsLoading(false)
        return
      }

      setPost(postData as BlogPost)
      setComments((commentsData ?? []) as BlogComment[])
      setLikesCount(likesCountRes.count ?? 0)
      setIsLiked(!!existingLikeRes.data)
      setIsLoading(false)
    }

    void load()
  }, [id, anonId])

  const handleLike = async () => {
    if (!id || !post || !anonId) return
    setIsLiking(true)
    const supabase = createClient()

    try {
      if (isLiked) {
        const { error } = await supabase
          .from("blog_likes")
          .delete()
          .eq("post_id", id)
          .eq("user_identifier", anonId)

        if (error) {
          console.error("Failed to unlike post", error)
          toast.error("Could not unlike this post")
        } else {
          setIsLiked(false)
          setLikesCount((c) => Math.max(0, c - 1))
        }
      } else {
        const { error } = await supabase.from("blog_likes").insert({
          post_id: id,
          user_identifier: anonId,
        })

        if (error) {
          if ((error as any).code === "23505") {
            toast.message("You already liked this post")
            setIsLiked(true)
          } else {
            console.error("Failed to like post", error)
            toast.error("Could not like this post")
          }
        } else {
          setIsLiked(true)
          setLikesCount((c) => c + 1)
          toast.success("Thanks for the love!")
        }
      }
    } finally {
      setIsLiking(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !commentForm.name || !commentForm.message) {
      toast.error("Please add your name and a message")
      return
    }

    setIsSubmittingComment(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("blog_comments")
      .insert({
        post_id: id,
        user_name: commentForm.name,
        message: commentForm.message,
      })
      .select("id,user_name,message,created_at")
      .single()

    setIsSubmittingComment(false)

    if (error || !data) {
      console.error("Failed to add comment", error)
      toast.error("Could not add comment")
      return
    }

    setComments((prev) => [...prev, data as BlogComment])
    setCommentForm({ name: "", message: "" })
    toast.success("Comment added")
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Unable to copy link")
    }
  }

  const formatTimeAgo = (iso: string) => {
    const now = new Date()
    const then = new Date(iso)
    const diffMs = now.getTime() - then.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d`
    return then.toLocaleDateString()
  }

  const renderCaptionWithHashtags = (caption: string) => {
    const parts = caption.split(/(\#[a-zA-Z0-9_]+)/g)
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        const tag = part.slice(1)
        return (
          <button
            key={`${part}-${index}`}
            type="button"
            className="text-primary hover:underline"
            onClick={() =>
              toast.message(`#${tag}`, {
                description: "Hashtag filtering can be added here.",
              })
            }
          >
            {part}
          </button>
        )
      }
      return <span key={`${part}-${index}`}>{part}</span>
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f97316]/40 via-[#ec4899]/40 to-[#6366f1]/40">
      <Navigation />
      <main>
        <section className="py-10">
          <div className="container mx-auto max-w-xl px-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading post...</p>
            ) : !post ? (
              <p className="text-center text-muted-foreground">Post not found.</p>
            ) : (
              <div className="space-y-10">
                <Card className="overflow-hidden border-0 bg-background/95 shadow-xl shadow-black/20 backdrop-blur">
                  <CardContent className="space-y-3 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-primary/40">
                          <AvatarImage src="/logo.jpeg" alt="AD Club" />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold leading-none text-foreground">
                            Arena App Dev Club
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-md bg-muted">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="aspect-[4/5] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/5] items-center justify-center text-xs text-muted-foreground">
                          No image provided
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${isLiked ? "text-red-500" : "text-foreground"}`}
                          onClick={handleLike}
                          disabled={isLiking}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isLiked ? "fill-red-500" : "fill-transparent"
                            }`}
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={handleShare}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                      {post.featured && (
                        <Badge className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#6366f1] text-[10px] font-medium uppercase">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <p className="font-semibold text-foreground">
                        {likesCount} {likesCount === 1 ? "like" : "likes"}
                      </p>
                      <p className="space-x-1 break-words text-foreground">
                        <span className="font-semibold">Arena App Dev Club</span>
                        <span>{renderCaptionWithHashtags(post.content)}</span>
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="rounded-full border-primary/20 bg-primary/5 text-primary"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <MessageCircle className="h-4 w-4" />
                      Comments ({comments.length})
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No comments yet. Be the first to share your thoughts.
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <Card key={comment.id} className="border-0 bg-muted/50">
                          <CardContent className="space-y-1 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">
                                {comment.user_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {comment.message}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Comment form */}
                  <Card className="border-0 bg-card/80">
                    <CardHeader>
                      <CardTitle className="text-base text-foreground">Add a comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-3" onSubmit={handleSubmitComment}>
                        <Input
                          placeholder="Your name"
                          value={commentForm.name}
                          onChange={(e) =>
                            setCommentForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          required
                        />
                        <Textarea
                          rows={3}
                          placeholder="Share your thoughts..."
                          value={commentForm.message}
                          onChange={(e) =>
                            setCommentForm((prev) => ({ ...prev, message: e.target.value }))
                          }
                          required
                        />
                        <Button type="submit" disabled={isSubmittingComment} className="gap-2">
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

