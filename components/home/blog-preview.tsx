import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, FileText } from "lucide-react"

const BLOG_PREVIEW_LIMIT = 3

export async function BlogPreview() {
  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, title, content, cover_image_url, created_at, featured")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(BLOG_PREVIEW_LIMIT)

  const items = error ? [] : (posts ?? [])

  return (
    <section id="blog" className="scroll-mt-20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            From the Blog
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Latest Stories & Updates
          </h2>
          <p className="mt-3 text-muted-foreground">
            Workshop recaps, hackathon highlights, and behind-the-scenes from AD Club. Like, comment, and share.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">No blog posts yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              When the club publishes its first post, it will show here. Visit the blog to see the full feed.
            </p>
            <Button asChild variant="outline" className="mt-2 gap-2">
              <Link href="/blog">
                Go to Blog
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="group">
                  <Card className="h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-glow">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title ?? "Blog post"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <FileText className="h-12 w-12" />
                        </div>
                      )}
                      {post.featured && (
                        <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                          Featured
                        </span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                        {post.title || "Untitled"}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {post.content}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/blog">
                  View All Posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
