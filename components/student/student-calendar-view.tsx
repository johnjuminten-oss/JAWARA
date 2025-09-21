"use client"

import { EnhancedCalendar } from "@/components/calendar/enhanced-calendar"
import { EventDetails } from "@/components/schedule/event-details"
import type { Database } from "@/types/database.types"
import type { Event } from "@/types/events"

type DbEvent = Database['public']['Tables']['events']['Row']
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useEventsContext } from "@/hooks/use-events"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, Clock, MapPin, GraduationCap, BookOpen } from "lucide-react"
import { EventForm } from "@/components/schedule/event-form"

interface StudentCalendarViewProps {
  userId: string
  userRole: string
  classId?: string
}

export function StudentCalendarView({ userId, userRole, classId }: StudentCalendarViewProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [classInfo, setClassInfo] = useState<any>(null)
  const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map())

  // We'll derive events from the shared provider and keep fetching class/profile info locally
  const { events: sharedEvents, refresh, isLoading: sharedLoading } = useEventsContext()

  const fetchClassAndProfiles = async () => {
    try {
      const supabase = createClient()
      if (!classId) return
      const { data: classData } = await supabase.from("classes").select("*, batches(*)").eq("id", classId).single()
      setClassInfo(classData)

      // Map sharedEvents to full Event type with defaults for missing properties
      const mappedEvents: Event[] = (sharedEvents || [])
        .filter(e => e.created_by)
        .map(e => ({
          id: e.id,
          title: e.title,
          description: e.description || "",
          event_type: e.event_type,
          start_at: e.start_at,
          end_at: e.end_at || e.start_at,
          location: e.location || null,
          created_by: e.created_by,
          created_by_role: (e as Event).created_by_role || "student",
          target_class: e.target_class || null,
          target_user: (e as Event).target_user || null,
          teacher_id: (e as Event).teacher_id || null,
          visibility_scope: e.visibility_scope,
          metadata: e.metadata || null,
          is_deleted: (e as Event).is_deleted || false,
          created_at: e.created_at,
          updated_at: e.updated_at,
        }))
      setEvents(mappedEvents)

      const userIds = [...new Set(mappedEvents.map(event => event.created_by))]
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, role").in("id", userIds)
        const userMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])
        setUserProfiles(userMap)
      }
    } catch (error) {
      console.error("Error fetching class/profile data:", error)
    }
  }

  const getUserName = (userId: string) => {
    const profile = userProfiles.get(userId)
    return profile?.full_name || userId
  }

  useEffect(() => {
    // For students, show:
    // 1. Their personal events
    // 2. Events targeted to their class
    // 3. Schoolwide events (broadcasts, prayers, breaks)
    const personal = (sharedEvents || []).filter(e => e.created_by === userId && e.event_type === 'personal')
    const classEvents = (sharedEvents || []).filter(e => {
      // Convert event type to string for safe comparison
      const eventType = e.event_type as string
      // Events targeted to student's class
      return e.target_class === classId ||
      // Schoolwide events
      e.visibility_scope === 'schoolwide' ||
      // Any broadcast or announcement type events
      eventType.toLowerCase().includes('broadcast') ||
      eventType.toLowerCase().includes('announcement')
    })

    const allEvents = [...personal, ...classEvents]
    const uniqueEvents = allEvents.filter((event, index, self) => index === self.findIndex((e) => e.id === event.id))

    // Map events to include all required properties for Event type from types/events.ts
    const mappedEvents = uniqueEvents.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || "",
      event_type: e.event_type,
      start_at: e.start_at,
      end_at: e.end_at || e.start_at,
      location: e.location || null,
      created_by: e.created_by,
      created_by_role: (e as Event).created_by_role || "student",
      target_class: e.target_class || null,
      target_user: (e as Event).target_user || null,
      teacher_id: (e as Event).teacher_id || null,
      visibility_scope: e.visibility_scope,
      metadata: e.metadata || null,
      is_deleted: (e as Event).is_deleted || false,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }))

    setEvents(mappedEvents)

    // refresh class/profile info if sharedEvents changed
    fetchClassAndProfiles()
    // mirror provider loading state locally so the UI shows/hides the loader correctly
    setIsLoading(sharedLoading)
  }, [sharedEvents, userId, classId, sharedLoading])

  const handleAddEvent = () => {
    setShowEventForm(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowEventForm(true)
  }

  const handleEventClick = (event: Event) => {
    setShowEventDetails(event)
  }

  const handleEventFormClose = () => {
    setShowEventForm(false)
    setSelectedDate(undefined)
  }

  const handleEventFormSuccess = () => {
    setShowEventForm(false)
    setSelectedDate(undefined)
    // refresh shared events so all components update
    refresh()
  }

  const handleEventDetailsClose = () => {
    setShowEventDetails(null)
  }

  const handleEventDelete = () => {
    setShowEventDetails(null)
    refresh()
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
      default:
        return eventType
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>
  }

  if (!classId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            No Class Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            You haven&apos;t been assigned to a class yet. Please contact your administrator to get assigned to a batch and class.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-800 mb-2">What this means:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You cannot see class schedules and events</li>
              <li>• You cannot view the class calendar</li>
              <li>• You can only create personal events</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-6">
      {/* Class Information Header */}
      {classInfo && (
        <Card>
          <CardHeader className="pb-1 sm:pb-4">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              {classInfo.name} Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">Batch: {classInfo.batches?.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">Class: {classInfo.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {events.filter(e => e.target_class === classId).length} Events
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <EnhancedCalendar
        showFilters={false} // Disable filters for student view
        events={events.map(e => ({
          id: e.id,
          title: e.title,
          description: e.description || "",
          start_at: e.start_at,
          end_at: e.end_at || e.start_at,
          created_at: format(new Date(e.created_at), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          updated_at: format(new Date(e.updated_at), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          created_by: e.created_by,
          created_by_role: e.created_by_role,
          event_type: e.event_type,
          visibility_scope: e.visibility_scope,
          target_class: e.target_class,
          target_user: e.target_user,
          teacher_id: e.teacher_id,
          location: e.location || null,
          metadata: e.metadata || null,
          is_deleted: e.is_deleted || false,
        }))}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onAddEvent={handleAddEvent}
        canAddEvents={true}
      />

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onClose={handleEventFormClose}
          onSuccess={handleEventFormSuccess}
          initialDate={selectedDate}
          userRole={userRole}
          userId={userId}
          classId={classId}
        />
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <EventDetails
          event={showEventDetails as DbEvent}
          onClose={handleEventDetailsClose}
          onDelete={handleEventDelete}
          canEdit={showEventDetails.created_by === userId}
          canDelete={showEventDetails.created_by === userId}
        />
      )}
    </div>
  )
}
