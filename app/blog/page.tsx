"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageCircle, Share2, MoreHorizontal, Link2, Flag, X } from "lucide-react"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 5

type BlogPost = {
  id: string
  title: string | null
  content: string
  tags: string[] | null
  featured: boolean
  status: "draft" | "published"
  cover_image_url: string | null
  created_at: string
}

type FeedPost = BlogPost & {
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

type BlogComment = {
  id: string
  user_name: string
  message: string
  created_at: string
}

function BlogPostCard({
  post,
  likingPostId,
  onLike,
  onOpenComments,
  onShare,
  onCopyLink,
  formatTimeAgo,
  renderCaptionWithHashtags,
  toast,
}: {
  post: FeedPost
  likingPostId: string | null
  onLike: () => void
  onOpenComments: () => void
  onShare: () => void
  onCopyLink: () => void
  formatTimeAgo: (iso: string) => string
  renderCaptionWithHashtags: (caption: string) => React.ReactNode
  toast: typeof import("sonner").toast
}) {
  const lastTapRef = useRef(0)
  const [showHeartPop, setShowHeartPop] = useState(false)

  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      onLike()
      setShowHeartPop(true)
      setTimeout(() => setShowHeartPop(false), 600)
    }
    lastTapRef.current = now
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 bg-background/95 shadow-xl shadow-black/20 backdrop-blur">
        <CardContent className="space-y-0 p-0 sm:space-y-3 sm:p-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 p-3 sm:p-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border border-primary/40 sm:h-9 sm:w-9">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[100] min-w-[10rem]">
                <DropdownMenuItem onClick={onCopyLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.message("Report", { description: "Report option can be implemented here." })}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <X className="mr-2 h-4 w-4" />
                  Close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image: double-tap to like, hover zoom on desktop */}
          <div
            className="group relative aspect-[4/5] w-full overflow-hidden bg-muted sm:rounded-md"
            onDoubleClick={handleDoubleTap}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleDoubleTap()}
            aria-label="Double-tap to like"
          >
            {post.cover_image_url ? (
              <motion.img
                src={post.cover_image_url}
                alt={post.title ?? "AD Club post"}
                className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                initial={false}
                whileHover={{ scale: 1.02 }}
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center text-xs text-muted-foreground">
                No image provided
              </div>
            )}
            {showHeartPop && (
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg" />
              </motion.div>
            )}
          </div>

          {/* Action bar: sticky on mobile, larger tap targets */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-border/50 bg-background/95 px-2 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:py-1 sm:backdrop-blur-none">
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.button
                type="button"
                aria-label={post.isLiked ? "Unlike" : "Like"}
                className={`inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 ${
                  post.isLiked ? "text-red-500 hover:bg-red-500/10" : "text-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={onLike}
                disabled={likingPostId === post.id}
                whileTap={{ scale: 0.9 }}
              >
                <motion.span
                  animate={
                    post.isLiked && likingPostId !== post.id
                      ? { scale: [1, 1.35, 1], transition: { duration: 0.35 } }
                      : {}
                  }
                >
                  <Heart
                    className={`h-6 w-6 sm:h-5 sm:w-5 ${
                      post.isLiked ? "fill-red-500" : "fill-transparent"
                    }`}
                  />
                </motion.span>
              </motion.button>
              <button
                type="button"
                aria-label="Comments"
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                onClick={onOpenComments}
              >
                <MessageCircle className="h-6 w-6 sm:h-5 sm:w-5" />
              </button>
              <motion.button
                type="button"
                aria-label="Share"
                className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                onClick={onShare}
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="h-6 w-6 sm:h-5 sm:w-5" />
              </motion.button>
            </div>
            {post.featured && (
              <Badge className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#6366f1] text-[10px] font-medium uppercase">
                Featured
              </Badge>
            )}
          </div>

          {/* Caption & meta */}
          <div className="space-y-1.5 px-3 pb-3 text-sm sm:px-0">
            <p className="font-semibold text-foreground">
              {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
            </p>
            <p className="space-x-1 break-words text-foreground">
              <span className="font-semibold">Arena App Dev Club</span>
              <span>{renderCaptionWithHashtags(post.content)}</span>
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-primary hover:bg-primary/15"
                    onClick={() =>
                      toast.message(`#${tag}`, {
                        description: "Hashtag filtering can be added here.",
                      })
                    }
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            {post.commentsCount > 0 && (
              <button
                type="button"
                className="pt-1 text-xs font-medium text-muted-foreground hover:underline"
                onClick={onOpenComments}
              >
                View all {post.commentsCount}{" "}
                {post.commentsCount === 1 ? "comment" : "comments"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.article>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [anonId, setAnonId] = useState<string | null>(null)
  const [likingPostId, setLikingPostId] = useState<string | null>(null)

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [activePost, setActivePost] = useState<FeedPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentForm, setCommentForm] = useState({ name: "", message: "" })

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const supabase = useMemo(() => createClient(), [])

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
    if (!anonId) return

    const load = async (startOffset: number, initial: boolean) => {
      if (initial) {
        setIsInitialLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(startOffset, startOffset + PAGE_SIZE - 1)

      if (error) {
        console.error("Failed to load posts", error)
        
        // Check if table doesn't exist (initialization needed)
        if (error.code === 'PGRST205' || error.message?.includes("Could not find the table")) {
          setLoadError("Database not initialized. Please visit /setup to initialize.")
          toast.error("Please initialize the database at /setup")
        } else {
          setLoadError(error.message || "Failed to load blog posts")
          toast.error("Failed to load blog posts")
        }
        
        setIsInitialLoading(false)
        setIsLoadingMore(false)
        return
      }
      setLoadError(null)

      const rawPosts = (data ?? []) as BlogPost[]

      const enriched = await Promise.all(
        rawPosts.map(async (post) => {
          const [likesRes, commentsRes, existingLikeRes] = await Promise.all([
            supabase
              .from("blog_likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
            supabase
              .from("blog_comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
            supabase
              .from("blog_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_identifier", anonId)
              .maybeSingle(),
          ])

          return {
            ...post,
            likesCount: likesRes.count ?? 0,
            commentsCount: commentsRes.count ?? 0,
            isLiked: !!existingLikeRes.data,
          } as FeedPost
        })
      )

      setPosts((prev) => (initial ? enriched : [...prev, ...enriched]))
      const received = enriched.length
      setOffset(startOffset + received)
      setHasMore(received === PAGE_SIZE)
      setIsInitialLoading(false)
      setIsLoadingMore(false)
    }

    void load(0, true)
  }, [anonId, supabase, refreshTrigger])

  useEffect(() => {
    if (!hasMore || isInitialLoading) return

    const el = loadMoreRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && !isLoadingMore) {
          const loadMore = async () => {
            const { data, error } = await supabase
              .from("blog_posts")
              .select("*")
              .eq("status", "published")
              .order("created_at", { ascending: false })
              .range(offset, offset + PAGE_SIZE - 1)

            if (error) {
              console.error("Failed to load more posts", error)
              toast.error("Failed to load more posts")
              return
            }

            const rawPosts = (data ?? []) as BlogPost[]
            if (rawPosts.length === 0) {
              setHasMore(false)
              return
            }

            setIsLoadingMore(true)

            const enriched = await Promise.all(
              rawPosts.map(async (post) => {
                const [likesRes, commentsRes, existingLikeRes] = await Promise.all([
                  supabase
                    .from("blog_likes")
                    .select("*", { count: "exact", head: true })
                    .eq("post_id", post.id),
                  supabase
                    .from("blog_comments")
                    .select("*", { count: "exact", head: true })
                    .eq("post_id", post.id),
                  supabase
                    .from("blog_likes")
                    .select("id")
                    .eq("post_id", post.id)
                    .eq("user_identifier", anonId)
                    .maybeSingle(),
                ])

                return {
                  ...post,
                  likesCount: likesRes.count ?? 0,
                  commentsCount: commentsRes.count ?? 0,
                  isLiked: !!existingLikeRes.data,
                } as FeedPost
              })
            )

            setPosts((prev) => [...prev, ...enriched])
            const received = enriched.length
            setOffset((prevOffset) => prevOffset + received)
            setHasMore(received === PAGE_SIZE)
            setIsLoadingMore(false)
          }

          void loadMore()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [hasMore, isInitialLoading, isLoadingMore, offset, anonId, supabase])

  const toggleLike = async (postId: string) => {
    if (!anonId) return
    const target = posts.find((p) => p.id === postId)
    if (!target) return

    const currentlyLiked = target.isLiked
    setLikingPostId(postId)

    // Optimistic update: apply immediately for snappy UX
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        if (currentlyLiked) {
          return { ...p, isLiked: false, likesCount: Math.max(0, p.likesCount - 1) }
        }
        return { ...p, isLiked: true, likesCount: p.likesCount + 1 }
      })
    )

    if (currentlyLiked) {
      const { error } = await supabase
        .from("blog_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_identifier", anonId)

      if (error) {
        console.error("Failed to unlike post", error)
        toast.error("Could not unlike post")
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: true, likesCount: target.likesCount } : p
          )
        )
      }
    } else {
      const { error } = await supabase.from("blog_likes").insert({
        post_id: postId,
        user_identifier: anonId,
      })

      if (error) {
        if ((error as { code?: string }).code === "23505") {
          toast.message("You already liked this post")
        } else {
          console.error("Failed to like post", error)
          toast.error("Could not like post")
        }
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: false, likesCount: target.likesCount } : p
          )
        )
      }
    }

    setLikingPostId(null)
  }

  const openComments = async (post: FeedPost) => {
    setActivePost(post)
    setCommentsOpen(true)
    setIsLoadingComments(true)

    const { data, error } = await supabase
      .from("blog_comments")
      .select("id,user_name,message,created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to load comments", error)
      toast.error("Failed to load comments")
      setIsLoadingComments(false)
      return
    }

    setComments((data ?? []) as BlogComment[])
    setIsLoadingComments(false)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activePost) return
    if (!commentForm.name || !commentForm.message) {
      toast.error("Please add your name and a comment")
      return
    }

    setIsSubmittingComment(true)

    const { data, error } = await supabase
      .from("blog_comments")
      .insert({
        post_id: activePost.id,
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === activePost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    )
    toast.success("Comment added")
  }

  const getShareUrl = (postId: string) => `${typeof window !== "undefined" ? window.location.origin : ""}/blog/${postId}`

  const handleShare = async (post: FeedPost, source: "button" | "menu" = "button") => {
    const url = getShareUrl(post.id)
    const title = post.title ?? "AD Club post"
    const text = post.content.slice(0, 100)

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        toast.success("Shared successfully")
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        try {
          await navigator.clipboard.writeText(url)
          toast.success("Link copied to clipboard")
        } catch {
          toast.error("Could not share or copy. Try copying the link manually.")
        }
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Could not copy link. Please try again.")
    }
  }

  const handleCopyLink = async (postId: string) => {
    const url = getShareUrl(postId)
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Could not copy link")
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
    const parts = caption.split(/(#[a-zA-Z0-9_]+)/g)
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

  const isLoading = isInitialLoading && posts.length === 0

  if (loadError && !isInitialLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f97316]/40 via-[#ec4899]/40 to-[#6366f1]/40">
        <Navigation />
        <main className="pb-24 pt-6">
          <section className="mx-auto max-w-xl px-4">
            <Card className="border-0 bg-background/90 text-center shadow-xl">
              <CardContent className="space-y-3 p-8">
                <p className="text-base font-medium text-destructive">{loadError}</p>
                <p className="text-sm text-muted-foreground">
                  Check your connection and that the blog is set up in Supabase (run scripts/003_complete_setup.sql).
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLoadError(null)
                    setIsInitialLoading(true)
                    setRefreshTrigger((prev) => prev + 1)
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f97316]/40 via-[#ec4899]/40 to-[#6366f1]/40">
      <Navigation />
      <main className="pb-24 pt-6">
        <section className="mb-6">
          <div className="mx-auto flex max-w-xl flex-col gap-3 px-4 text-sm text-muted-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Blog
            </p>
            <h1 className="text-2xl font-bold text-foreground">AD Club Moments</h1>
            <p>
              Scroll through workshop snapshots, hackathon highlights, and behind-the-scenes
              stories – all shared like an Instagram feed.
            </p>
          </div>
        </section>

        <section className="flex justify-center px-0 sm:px-2 md:px-4">
          <div className="w-full max-w-xl space-y-4 pb-10 sm:max-w-xl md:max-w-2xl">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="overflow-hidden border-0 bg-background/90 shadow-xl shadow-black/10"
                >
                  <CardContent className="space-y-3 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-6" />
                    </div>
                    <Skeleton className="aspect-[4/5] w-full rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : posts.length === 0 ? (
              <Card className="border-0 bg-background/90 text-center shadow-xl shadow-black/10">
                <CardContent className="space-y-2 p-8">
                  <p className="text-base font-medium text-foreground">No posts yet.</p>
                  <p className="text-sm text-muted-foreground">
                    When the AD Club shares its first story, it will appear here like an
                    Instagram feed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    likingPostId={likingPostId}
                    onLike={() => toggleLike(post.id)}
                    onOpenComments={() => openComments(post)}
                    onShare={() => handleShare(post)}
                    onCopyLink={() => handleCopyLink(post.id)}
                    formatTimeAgo={formatTimeAgo}
                    renderCaptionWithHashtags={renderCaptionWithHashtags}
                    toast={toast}
                  />
                ))}

                <div ref={loadMoreRef} className="h-10 w-full">
                  {isLoadingMore && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Loading more posts...
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Drawer open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Comments</DrawerTitle>
            <DrawerDescription>Share your thoughts – no login required.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {isLoadingComments ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to say something nice.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg bg-muted/60 p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {comment.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {comment.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DrawerFooter className="border-t bg-background/80">
            <form className="space-y-3" onSubmit={handleSubmitComment}>
              <div className="flex gap-2">
                <Input
                  placeholder="Your name"
                  value={commentForm.name}
                  onChange={(e) =>
                    setCommentForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <Textarea
                rows={2}
                placeholder="Add a comment..."
                value={commentForm.message}
                onChange={(e) =>
                  setCommentForm((prev) => ({ ...prev, message: e.target.value }))
                }
                required
              />
              <Button type="submit" disabled={isSubmittingComment}>
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

