"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Calendar } from "lucide-react"
import type { Event } from "@/types/events"
import { EventType, getEventBackgroundColor, getEventTextColor, getEventBorderColor } from "@/lib/event-colors"

interface UpcomingSchedulesProps {
  events: Event[]
  showSubject?: boolean
}

export function UpcomingSchedules({ events, showSubject }: UpcomingSchedulesProps) {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day for date comparison
  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.start_at)
      eventDate.setHours(0, 0, 0, 0) // Reset to start of day for date comparison
      return eventDate >= now
    })
    .sort((a, b) => {
      const dateA = new Date(a.start_at)
      const dateB = new Date(b.start_at)
      // First sort by date
      const dateDiff = dateA.getTime() - dateB.getTime()
      if (dateDiff !== 0) return dateDiff
      // Then by time if dates are the same
      return dateA.getHours() * 60 + dateA.getMinutes() - (dateB.getHours() * 60 + dateB.getMinutes())
    })

  const todayEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.start_at)
    return eventDate.toDateString() === now.toDateString()
  })

  const upcomingEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.start_at)
    return eventDate.toDateString() !== now.toDateString()
  })

  const getEventTypeLabel = (eventType: EventType) => {
    return eventType.split('_').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  const getEventStyles = (type: EventType) => {
    return {
      backgroundColor: getEventBackgroundColor(type),
      color: getEventTextColor(type),
      borderColor: getEventBorderColor(type),
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-5">
        <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3 text-blue-600" aria-hidden="true" />
          Upcoming Class Schedules
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 lg:px-8">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" aria-hidden="true" />
            <p className="text-base sm:text-lg text-gray-500 font-medium">No upcoming events</p>
            <p className="text-sm sm:text-base text-gray-400 mt-2">Your schedule is clear!</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Upcoming schedules">
            {/* Today's Events */}
            {todayEvents.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 text-blue-600">Today</h3>
                <div className="space-y-3 sm:space-y-4">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 bg-white hover:shadow-md transition-shadow"
                      style={{ borderColor: getEventBorderColor(event.event_type as EventType) }}
                      role="listitem"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                            {event.title}
                          </h4>
                          <Badge 
                            className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 w-fit"
                            style={getEventStyles(event.event_type as EventType)}
                          >
                            {getEventTypeLabel(event.event_type as EventType)}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-1.5">
                          <div className="flex items-center text-sm sm:text-base text-gray-600">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                            <span className="font-semibold">{formatTime(event.start_at)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm sm:text-base text-gray-600">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                              <span className="font-semibold">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-3 text-gray-600">Coming Up</h3>
                <div className="space-y-3 sm:space-y-4">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 bg-white hover:shadow-md transition-shadow"
                      style={{ borderColor: getEventBorderColor(event.event_type as EventType) }}
                      role="listitem"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                            {event.title}
                          </h4>
                          <Badge 
                            className="text-xs font-medium px-2 py-0.5"
                            style={getEventStyles(event.event_type as EventType)}
                          >
                            {getEventTypeLabel(event.event_type as EventType)}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center text-sm sm:text-base text-gray-600">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                            <span className="font-semibold">
                              {formatDate(event.start_at)} at {formatTime(event.start_at)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm sm:text-base text-gray-600">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                              <span className="font-semibold">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length > 5 && (
                    <div className="text-center pt-1 border-t border-gray-100">
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        Showing 5 of {upcomingEvents.length} upcoming events
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
