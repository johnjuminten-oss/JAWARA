"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/types"

interface EventsContextValue {
  events: Event[]
  refresh: () => Promise<void>
  isLoading: boolean
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined)

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase.from("events").select("*").order("start_at", { ascending: true })
      // Normalize date fields so downstream consumers parse consistently.
      const normalized = (data as any || []).map((e: any) => {
        const safeStart = e.start_at ? new Date(e.start_at) : null
        const safeEnd = e.end_at ? new Date(e.end_at) : (safeStart ? new Date(safeStart) : null)

        return {
          ...e,
          // store ISO strings (UTC) so consumers get a predictable format
          start_at: safeStart ? safeStart.toISOString() : null,
          end_at: safeEnd ? safeEnd.toISOString() : null,
        }
      })

      setEvents(normalized)
    } catch (err) {
      console.error("Error fetching events in EventsProvider:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <EventsContext.Provider value={{ events, refresh: fetchEvents, isLoading }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEventsContext() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error("useEventsContext must be used within EventsProvider")
  return ctx
}

export default EventsProvider
