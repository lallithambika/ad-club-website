"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts"
import { BarChart3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type MonthlyCount = { label: string; value: number }

export default function AdminAnalyticsPage() {
  const [eventsOverTime, setEventsOverTime] = useState<MonthlyCount[]>([])
  const [engagementOverTime, setEngagementOverTime] = useState<
    { label: string; likes: number; comments: number }[]
  >([])
  const [projectCategories, setProjectCategories] = useState<MonthlyCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [eventsRes, likesRes, commentsRes, projectsRes] = await Promise.all([
        supabase.from("events").select("created_at"),
        supabase.from("blog_likes").select("created_at"),
        supabase.from("blog_comments").select("created_at"),
        supabase.from("projects").select("category"),
      ])

      const bucketByMonth = (rows: { created_at: string }[]): MonthlyCount[] => {
        const map = new Map<string, number>()
        rows.forEach((r) => {
          const d = new Date(r.created_at)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
          map.set(key, (map.get(key) ?? 0) + 1)
        })
        return Array.from(map.entries())
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([label, value]) => ({ label, value }))
      }

      if (eventsRes.error) throw new Error(eventsRes.error.message)
      if (eventsRes.data) {
        setEventsOverTime(bucketByMonth(eventsRes.data as { created_at: string }[]))
      }

      if (likesRes.error || commentsRes.error) {
        setEngagementOverTime([])
      } else if (likesRes.data && commentsRes.data) {
        const likeBuckets = bucketByMonth(likesRes.data as { created_at: string }[])
        const commentBuckets = bucketByMonth(commentsRes.data as { created_at: string }[])
        const labels = new Set<string>()
        likeBuckets.forEach((b) => labels.add(b.label))
        commentBuckets.forEach((b) => labels.add(b.label))
        const combined = Array.from(labels)
          .sort()
          .map((label) => ({
            label,
            likes: likeBuckets.find((b) => b.label === label)?.value ?? 0,
            comments: commentBuckets.find((b) => b.label === label)?.value ?? 0,
          }))
        setEngagementOverTime(combined)
      }

      if (projectsRes.error) throw new Error(projectsRes.error.message)
      if (projectsRes.data) {
        const map = new Map<string, number>()
        ;(projectsRes.data as { category: string }[]).forEach((p) => {
          const key = p.category || "unknown"
          map.set(key, (map.get(key) ?? 0) + 1)
        })
        setProjectCategories(
          Array.from(map.entries()).map(([label, value]) => ({ label, value }))
        )
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void load()
  }, [load])

  const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground">
      <BarChart3 className="h-10 w-10" />
      <p>{message}</p>
    </div>
  )

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminHeader
          title="Analytics"
          description="High-level view of events, blog engagement, and project mix."
        />
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {loadError && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm font-medium text-destructive">{loadError}</p>
            <Button variant="outline" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && !loadError ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Events Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsOverTime.length === 0 ? (
                <EmptyChart message="No events yet. Create events in the Events section." />
              ) : (
                <ChartContainer
                  config={{
                    events: { label: "Events", color: "hsl(var(--primary))" },
                  }}
                  className="h-64"
                >
                  <BarChart data={eventsOverTime}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-events)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Blog Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementOverTime.length === 0 ? (
                <EmptyChart message="No likes or comments yet. Publish blog posts to see engagement." />
              ) : (
                <ChartContainer
                  config={{
                    likes: { label: "Likes", color: "hsl(var(--primary))" },
                    comments: { label: "Comments", color: "hsl(var(--secondary))" },
                  }}
                  className="h-64"
                >
                  <LineChart data={engagementOverTime}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      stroke="var(--color-likes)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      stroke="var(--color-comments)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">
                Project Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectCategories.length === 0 ? (
                <EmptyChart message="No projects yet. Add projects in the Projects section." />
              ) : (
                <ChartContainer
                  config={{
                    projects: { label: "Projects", color: "hsl(var(--primary))" },
                  }}
                  className="h-64"
                >
                  <BarChart data={projectCategories}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-projects)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminShell>
  )
}

