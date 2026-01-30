import { createClient } from "@/lib/supabase/server"
import { EventsCountdownClient } from "./events-countdown-client"

export async function EventsCountdown() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, time, location, status")
    .eq("status", "upcoming")
    .order("date", { ascending: true })
    .limit(5)

  const nextEvent = events?.[0] ?? null
  const upcoming = events?.slice(1, 4) ?? []

  return (
    <EventsCountdownClient nextEvent={nextEvent} upcoming={upcoming} />
  )
}
