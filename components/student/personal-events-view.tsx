"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"
import type { Event } from "@/types/events"

interface PersonalEventsViewProps {
  events: Event[]
  onAddEvent: () => void
}

export function PersonalEventsView({ events, onAddEvent }: PersonalEventsViewProps) {
  const allPersonalEvents = events
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()) // Most recent first

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-lg font-semibold">Personal Schedule</CardTitle>
        <Button onClick={onAddEvent} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
          <span className="hidden sm:inline">Add Personal Event</span>
          <span className="sm:hidden">Add Event</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-4">
          {allPersonalEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 sm:py-4 text-xs sm:text-sm">
              No personal events scheduled
            </p>
          ) : (
            allPersonalEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">{event.title}</p>
                  {event.description && (
                    <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center mt-1.5 sm:mt-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {new Date(event.start_at) > new Date()
                        ? `Starts ${formatDistanceToNow(parseISO(event.start_at), { addSuffix: true })}`
                        : `Started ${formatDistanceToNow(parseISO(event.start_at), { addSuffix: true })}`
                      }
                    </p>
                  </div>
                  {event.location && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">📍 {event.location}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
