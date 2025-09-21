"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, MapPin, X, Edit, Trash2, Eye } from "lucide-react"
import { useState } from "react"
import { EventVisibility } from "./event-visibility"
import type { Database } from "@/types/database.types"
import { EventForm } from "./event-form"

type Event = Database['public']['Tables']['events']['Row']
type EventType = Event['event_type']
type VisibilityScope = Event['visibility_scope']

interface EventDetailsProps {
  event: Event
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
  canDelete?: boolean
  onVisibilityChange?: (scope: VisibilityScope) => void
}

export function EventDetails({
  event,
  onClose,
  onEdit,
  onDelete,
  onVisibilityChange,
  canEdit = false,
  canDelete = false,
}: EventDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleEditSuccess = () => {
    setIsEditing(false)
    onEdit?.()
  }

  if (isEditing) {
    return (
      <EventForm
        existingEvent={{
          ...event,
          // Ensure metadata is a Record<string, any> | null
          metadata: typeof event.metadata === 'string' 
            ? JSON.parse(event.metadata) 
            : (event.metadata || null)
        }}
        onClose={() => setIsEditing(false)}
        onSuccess={handleEditSuccess}
        userRole={event.created_by_role}
        userId={event.created_by}
        classId={event.target_class || undefined}
        defaultEventType={event.event_type === 'urgent_broadcast' || event.event_type === 'class_announcement'
          ? 'broadcast'
          : event.event_type as "personal" | "lesson" | "exam" | "assignment" | "broadcast"}
      />
    )
  }

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case "lesson":
        return "bg-blue-100 text-blue-800"
      case "exam":
        return "bg-red-100 text-red-800"
      case "assignment":
        return "bg-yellow-100 text-yellow-800"
      case "personal":
        return "bg-purple-100 text-purple-800"
      case "broadcast":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "lesson":
        return "Lesson"
      case "exam":
        return "Exam"
      case "assignment":
        return "Assignment"
      case "broadcast":
        return "Announcement"
      case "personal":
        return "Personal"
      default:
        return eventType
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("events").delete().eq("id", event.id)

      if (error) throw error

      onDelete?.()
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const startDateTime = formatDateTime(event.start_at)
  const endDateTime = formatDateTime(event.end_at ?? event.start_at)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
              <div className="mt-1">
                <Badge variant="secondary" className={getEventTypeColor(event.event_type)}>
                  {getEventTypeLabel(event.event_type)}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{startDateTime.date}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {startDateTime.time} - {endDateTime.time}
                  {startDateTime.date !== endDateTime.date && ` (ends ${endDateTime.date})`}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Event Visibility */}
            {canEdit && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Visibility</span>
                </div>
                <EventVisibility
                  eventId={event.id}
                  initialVisibility={event.visibility_scope as 'personal' | 'class' | 'schoolwide'}
                  onVisibilityChange={onVisibilityChange as (scope: 'personal' | 'class' | 'schoolwide') => void}
                  className="w-full"
                />
              </div>
            )}

            {(canEdit || canDelete) && (
              <div className="flex space-x-2 pt-4 border-t">
                {canEdit && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)} 
                    className="flex-1 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 text-red-600 hover:text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
