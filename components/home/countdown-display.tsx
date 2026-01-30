"use client"

import { useEffect, useState } from "react"

type Props = { date: string; time?: string | null }

export function CountdownDisplay({ date, time }: Props) {
  const [diff, setDiff] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    past: boolean
  } | null>(null)

  useEffect(() => {
    const update = () => {
      const d = new Date(date)
      if (time) {
        const [h, m] = time.replace(/\s*(am|pm)/gi, "").split(":").map(Number)
        if (!isNaN(h)) d.setHours(h, m || 0, 0, 0)
      }
      const now = new Date()
      const ms = d.getTime() - now.getTime()
      if (ms <= 0) {
        setDiff({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true })
        return
      }
      const days = Math.floor(ms / (1000 * 60 * 60 * 24))
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((ms % (1000 * 60)) / 1000)
      setDiff({ days, hours, minutes, seconds, past: false })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [date, time])

  if (diff === null) return <div className="h-16 animate-pulse rounded-lg bg-muted" />

  if (diff.past) {
    return (
      <p className="rounded-lg bg-primary/10 px-4 py-3 text-center font-mono text-lg font-semibold text-primary">
        Event started
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {[
        { value: diff.days, label: "Days" },
        { value: diff.hours, label: "Hours" },
        { value: diff.minutes, label: "Min" },
        { value: diff.seconds, label: "Sec" },
      ].map(({ value, label }) => (
        <div
          key={label}
          className="rounded-lg border border-border/50 bg-muted/30 p-2 text-center"
        >
          <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] font-medium uppercase text-muted-foreground">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
