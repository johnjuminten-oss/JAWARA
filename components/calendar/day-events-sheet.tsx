"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Event } from "@/types/events"
import { format } from "date-fns"
import { Clock, MapPin } from "lucide-react"

interface DayEventsSheetProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function DayEventsSheet({ isOpen, onClose, date, events, onEventClick }: DayEventsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto">
        <SheetHeader>
          <SheetTitle>
            {format(date, "EEEE, MMMM d")}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {events.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">No events for this day</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border bg-white cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{format(new Date(event.start_at), "HH:mm")}</span>
                      {event.end_at && (
                        <>
                          <span>-</span>
                          <span>{format(new Date(event.end_at), "HH:mm")}</span>
                        </>
                      )}
                    </div>
                    {event.location && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
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
  )
}