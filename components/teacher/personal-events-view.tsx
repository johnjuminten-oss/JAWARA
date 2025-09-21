"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"

interface PersonalEvent {
  id: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
}

interface PersonalEventsViewProps {
  events: PersonalEvent[]
  onAddEvent: () => void
}

export function PersonalEventsView({ events, onAddEvent }: PersonalEventsViewProps) {
  const allPersonalEvents = events
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()) // Most recent first

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Personal Schedule</CardTitle>
        <Button onClick={onAddEvent} size="sm">
          Add Personal Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allPersonalEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No personal events scheduled
            </p>
          ) : (
            allPersonalEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">
                      {new Date(event.start_at) > new Date()
                        ? `Starts ${formatDistanceToNow(parseISO(event.start_at), { addSuffix: true })}`
                        : `Started ${formatDistanceToNow(parseISO(event.start_at), { addSuffix: true })}`
                      }
                    </p>
                  </div>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
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
