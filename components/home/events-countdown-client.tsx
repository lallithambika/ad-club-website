"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react"
import { CountdownDisplay } from "./countdown-display"

type EventRow = {
  id: string
  title: string
  date: string
  time: string | null
  location: string | null
  status: string
}

export function EventsCountdownClient({
  nextEvent,
  upcoming,
}: {
  nextEvent: EventRow | null
  upcoming: EventRow[]
}) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Events & Activity
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            What&apos;s Next
          </h2>
          <p className="mt-3 text-muted-foreground">
            Live countdown to the next event. Join workshops, hackathons, and meetups.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {nextEvent ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="h-full border-border/50 bg-card/50 shadow-glow transition-all duration-300 hover:border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">
                      Next Event
                    </CardTitle>
                    <p className="text-lg font-semibold text-primary">
                      {nextEvent.title}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CountdownDisplay date={nextEvent.date} time={nextEvent.time} />
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {nextEvent.date}
                      </span>
                      {nextEvent.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {nextEvent.time}
                        </span>
                      )}
                      {nextEvent.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {nextEvent.location}
                        </span>
                      )}
                    </div>
                    <Button asChild className="w-full gap-2" size="lg">
                      <Link href="/events">
                        View All Events
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              <div className="space-y-4 lg:col-span-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Upcoming
                </h3>
                {upcoming.length > 0 ? (
                  upcoming.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <Link href="/events">
                        <Card className="border-border/50 bg-card/30 transition-all duration-200 hover:border-primary/20 hover:bg-card/50">
                          <CardContent className="flex items-center justify-between p-4">
                            <div>
                              <p className="font-semibold text-foreground">
                                {event.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.date}
                                {event.location ? ` · ${event.location}` : ""}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    More events coming soon. Check back later.
                  </p>
                )}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5"
            >
              <Card className="border-dashed border-border bg-muted/20 text-center">
                <CardContent className="flex flex-col items-center gap-4 py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <p className="font-medium text-foreground">No upcoming events yet</p>
                  <p className="text-sm text-muted-foreground">
                    New workshops and hackathons will appear here.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
