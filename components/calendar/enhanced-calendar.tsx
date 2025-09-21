"use client"

import React from "react"
import { CalendarEventFilters } from "./calendar-event-filters"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

import { getEventBackgroundColor, getEventTextColor, getEventBorderColor } from "@/lib/event-colors"
import type { EventType } from "@/types/events"
import { Event } from "@/types/events"

interface EnhancedCalendarProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onDateClick?: (date: Date) => void
  onAddEvent?: () => void
  canAddEvents?: boolean
  showFilters?: boolean
}

export function EnhancedCalendar({
  events,
  onEventClick,
  onDateClick,
  onAddEvent,
  canAddEvents = false,
  showFilters = true,
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("week")
  const [selectedSheetDate, setSelectedSheetDate] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([
    "lesson", "regular_study", "academic_notes", "exam", "assignment", "break", "prayer", "sports", "arts",
    "administrative", "broadcast", "urgent_broadcast", "class_announcement", "personal"
  ])
  
  // Mobile 3-column view state
  const [mobileViewStartDate, setMobileViewStartDate] = useState(new Date())
  const mobileViewRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const filteredEvents = events.filter(event => selectedEventTypes.includes(event.event_type))

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "lesson": return "📚"
      case "regular_study": return "📖"
      case "academic_notes": return "📝"
      case "exam": return "📝"
      case "assignment": return "📋"
      case "break": return "☕"
      case "prayer": return "🙏"
      case "sports": return "⚽"
      case "arts": return "🎨"
      case "administrative": return "📋"
      case "broadcast": return "📢"
      case "urgent_broadcast": return "🚨"
      case "class_announcement": return "📣"
      case "personal": return "👤"
      default: return "📅"
    }
  }

  const getEventStyles = (type: EventType) => {
    const bg = getEventBackgroundColor(type)
    const text = getEventTextColor(type)
    const border = getEventBorderColor(type)
    return {
      backgroundColor: bg,
      color: text,
      borderColor: border,
    }
  }

  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)
      weekDates.push(currentDate)
    }
    return weekDates
  }

  // Mobile 3-column view functions
  const getMobileViewDates = () => {
    const dates = []
    for (let i = 0; i < 3; i++) {
      const date = new Date(mobileViewStartDate)
      date.setDate(mobileViewStartDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const navigateMobileView = (direction: 'prev' | 'next') => {
    const newDate = new Date(mobileViewStartDate)
    if (direction === 'prev') {
      newDate.setDate(mobileViewStartDate.getDate() - 3)
    } else {
      newDate.setDate(mobileViewStartDate.getDate() + 3)
    }
    setMobileViewStartDate(newDate)
  }

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      navigateMobileView('next')
    }
    if (isRightSwipe) {
      navigateMobileView('prev')
    }
  }

  // Reset mobile view when current date changes
  useEffect(() => {
    if (isMobile && view === 'week') {
      setMobileViewStartDate(currentDate)
    }
  }, [currentDate, isMobile, view])

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start_at)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForDateAndTime = (date: Date, hour: number) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start_at)
      const eventHour = eventDate.getHours()
      return eventDate.toDateString() === date.toDateString() && eventHour === hour
    })
  }

  const getEventsForSpecificDate = (date: Date) => {
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start_at)
      return eventDate.toDateString() === date.toDateString()
    }).sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
  }

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (view === "month") {
        if (direction === "prev") {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
      } else if (view === "week") {
        if (direction === "prev") {
          newDate.setDate(prev.getDate() - 7)
        } else {
          newDate.setDate(prev.getDate() + 7)
        }
      } else if (view === "day") {
        if (direction === "prev") {
          newDate.setDate(prev.getDate() - 1)
        } else {
          newDate.setDate(prev.getDate() + 1)
        }
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const weekDates = getWeekDates(currentDate)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 sm:pb-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
          {/* Left: Date navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm sm:text-base font-medium min-w-[150px] sm:min-w-[200px] text-center">
              {view === "month" ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : ""}
              {view === "week" ? `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}` : ""}
              {view === "day" ? formatDate(currentDate) : ""}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Left-aligned: View toggles */}
          <div className="flex items-center gap-1 w-full sm:w-auto justify-start">
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")} className="px-2 sm:px-4">
              <span className="sm:hidden">Month</span>
              <span className="hidden sm:inline">Month</span>
            </Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")} className="px-2 sm:px-4">
              <span className="sm:hidden">Week</span>
              <span className="hidden sm:inline">Week</span>
            </Button>
            <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")} className="px-2 sm:px-4">
              <span className="sm:hidden">Day</span>
              <span className="hidden sm:inline">Day</span>
            </Button>
            {canAddEvents && (
              <Button size="sm" onClick={onAddEvent} className="ml-1 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span className="sm:inline ml-1">Add Event</span>
              </Button>
            )}
          </div>

          {/* Right: Filters (only shown if showFilters is true) */}
          {showFilters && (
            <div className="w-full sm:w-auto">
              <CalendarEventFilters
                selectedTypes={selectedEventTypes}
                onFilterChange={setSelectedEventTypes}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {view === "month" && (
          <>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5 mb-1 sm:mb-2">
              {shortDaysOfWeek.map((day) => (
                <div key={day} className="text-center">
                  <span className="hidden sm:inline text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </span>
                  <span className="sm:hidden text-[10px] font-semibold text-gray-600 py-1">
                    {day.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1.5">
              {Array.from({ length: 42 }, (_, i) => {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1 - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + i)
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const dayEvents = getEventsForDate(date)
                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      min-h-[70px] sm:min-h-[100px] p-0.5 sm:p-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors
                      ${isToday(date) ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" : "bg-white border-gray-200"}
                      ${!isCurrentMonth ? "opacity-50" : ""}
                    `}
                    onClick={() => {
                      if (isMobile && view === "month") {
                        setSelectedSheetDate(date)
                        setSheetOpen(true)
                      } else {
                        onDateClick?.(date)
                      }
                    }}
                  >
                    <div className={`text-xs font-semibold mb-0 sm:mb-1 ${isToday(date) ? "text-blue-700" : "text-black"}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0 sm:space-y-1">
                      {isMobile ? (
                        dayEvents.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: getEventBackgroundColor(event.event_type) }}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[10px] text-gray-500">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        )
                      ) : (
                        <>
                          {dayEvents.slice(0, 3).map((event, eventIndex) => (
                            <div
                              key={`${event.id}-${eventIndex}`}
                              className="text-[11px] p-1.5 rounded border cursor-pointer transition-colors"
                              style={getEventStyles(event.event_type)}
                              onClick={(e) => {
                                e.stopPropagation()
                                onEventClick?.(event)
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="leading-none">{getEventTypeIcon(event.event_type)}</span>
                                <div className="truncate font-medium leading-tight">
                                  {event.title}
                                </div>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[11px] text-gray-500 text-center py-0.5 bg-gray-100 rounded">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {view === "week" && (
          <>
            {isMobile ? (
              // Mobile 3-column view
              <div className="space-y-2">
                {/* Mobile navigation header */}
                <div className="flex items-center justify-between px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMobileView('prev')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm font-medium text-gray-700">
                    {mobileViewStartDate.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric" 
                    })} - {new Date(mobileViewStartDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric" 
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMobileView('next')}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile 3-column calendar */}
                <div 
                  ref={mobileViewRef}
                  className="grid grid-cols-3 gap-2"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {getMobileViewDates().map((date) => (
                    <div
                      key={date.toISOString()}
                      className={`text-center p-2 rounded-t-lg ${
                        isToday(date) ? "bg-blue-100" : "bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600">
                        {shortDaysOfWeek[date.getDay()]}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isToday(date) ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {getMobileViewDates().map((date) => (
                    <div
                      key={date.toISOString()}
                      className={`min-h-[200px] border rounded-lg ${
                        isToday(date) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="p-2 space-y-1">
                        {getEventsForSpecificDate(date).length === 0 ? (
                          <div className="text-center text-gray-400 text-xs py-4">No events</div>
                        ) : (
                          getEventsForSpecificDate(date).map((event, eventIndex) => (
                            <div
                              key={`${event.id}-${eventIndex}`}
                              className="p-2 rounded border cursor-pointer transition-colors hover:shadow-sm"
                              style={getEventStyles(event.event_type)}
                              onClick={() => onEventClick?.(event)}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{getEventTypeIcon(event.event_type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs truncate leading-tight">
                                    {event.title}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs leading-tight opacity-80">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(event.start_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Desktop week view
              <ScrollArea className="w-full">
                <div className="min-w-[640px] space-y-2">
                  <div className="grid grid-cols-7 gap-0.5 sm:gap-2 mb-1 sm:mb-2">
                    {weekDates.map((date) => (
                    <div
                      key={date.toISOString()}
                      className={`text-center p-1 sm:p-2 rounded-t-lg ${
                        isToday(date) ? "bg-blue-100" : "bg-gray-50"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-semibold text-gray-600">
                        {shortDaysOfWeek[date.getDay()]}
                      </div>
                      <div
                        className={`text-base sm:text-lg font-bold ${
                          isToday(date) ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
                    {weekDates.map((date) => (
                    <div
                      key={date.toISOString()}
                      className={`h-fit border rounded-lg ${
                        isToday(date) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="p-0.5 sm:p-2 space-y-0.5 sm:space-y-2">
                        {getEventsForSpecificDate(date).length === 0 ? (
                          <div className="text-center text-gray-400 text-[10px] sm:text-xs py-2">No events</div>
                        ) : (
                          getEventsForSpecificDate(date).map((event, eventIndex) => (
                            <div
                              key={`${event.id}-${eventIndex}`}
                              className="p-1 rounded border cursor-pointer transition-colors hover:shadow-sm"
                              style={getEventStyles(event.event_type)}
                              onClick={() => onEventClick?.(event)}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{getEventTypeIcon(event.event_type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-[10px] truncate leading-tight">
                                    {event.title}
                                  </div>
                                  <div className="flex items-center gap-1 text-[8px] leading-tight opacity-80">
                                    <Clock className="w-2 h-2" />
                                    <span>{formatTime(event.start_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </>
        )}

        {view === "day" && (
          <div className="space-y-1 sm:space-y-3">
            <div className="text-center py-2 sm:py-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">{formatDate(currentDate)}</h3>
              <p className="text-[10px] sm:text-xs text-gray-600">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </p>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1.5">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourEvents = getEventsForDateAndTime(currentDate, hour)
                return (
                  <div key={hour} className="flex items-start gap-1 sm:gap-3 p-1 sm:p-2 border rounded-md hover:bg-gray-50/60">
                    <div className="w-10 sm:w-14 text-[10px] sm:text-xs font-medium text-gray-600 text-right pt-0.5">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 min-h-[36px] sm:min-h-[48px]">
                      {hourEvents.length === 0 ? (
                        <div className="text-gray-400 text-[10px] sm:text-xs py-1 sm:py-1.5">No events</div>
                      ) : (
                        hourEvents.map((event, eventIndex) => (
                          <div
                            key={`${event.id}-${eventIndex}`}
                            className="p-1.5 sm:p-2 rounded border cursor-pointer transition-colors hover:shadow-sm mb-1.5"
                            style={getEventStyles(event.event_type)}
                            onClick={() => onEventClick?.(event)}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                              <span className="text-sm sm:text-base leading-none">{getEventTypeIcon(event.event_type)}</span>
                              <div className="min-w-0">
                                <div className="font-semibold text-[10px] sm:text-sm truncate leading-tight">
                                  {event.title}
                                </div>
                                <div className="text-[9px] sm:text-[11px] opacity-75">
                                  {formatTime(event.start_at)} - {formatTime(event.end_at)}
                                </div>
                              </div>
                            </div>
                            {event.location && (
                              <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Bottom sheet for mobile month view */}
      {sheetOpen && selectedSheetDate && (
        <div className="sm:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>
                  {selectedSheetDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric"
                  })}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(80vh-80px)]">
                {getEventsForDate(selectedSheetDate).length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">No events for this day</p>
                ) : (
                  getEventsForDate(selectedSheetDate).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                      style={getEventStyles(event.event_type)}
                      onClick={() => {
                        onEventClick?.(event)
                        setSheetOpen(false)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(event.start_at)}</span>
                            {event.end_at && (
                              <>
                                <span>-</span>
                                <span>{formatTime(event.end_at)}</span>
                              </>
                            )}
                          </div>
                          {event.location && (
                            <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </Card>
  )
}