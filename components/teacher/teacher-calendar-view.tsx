"use client"

import { EnhancedCalendar } from "@/components/calendar/enhanced-calendar"
import { EventForm } from "@/components/schedule/event-form"
import { EventDetails } from "@/components/schedule/event-details"
import { ScheduleTypeSelectorModal } from "@/components/teacher/schedule-type-selector-modal"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useEventsContext } from "@/hooks/use-events"
import { Event } from "@/types/events"

interface TeacherCalendarViewProps {
  userId: string
  userRole: string
  classId?: string
  viewMode?: 'my_lessons' | 'full_class' | 'personal_schedule' | 'all_schedule'
  classes?: any[]
}

export function TeacherCalendarView({ userId, userRole, classId, viewMode = 'my_lessons', classes = [] }: TeacherCalendarViewProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState<Event | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedEventType, setSelectedEventType] = useState<'student' | 'personal'>('student')
  const [isLoading, setIsLoading] = useState(true)
  const { events: sharedEvents, refresh, isLoading: sharedLoading } = useEventsContext()

  useEffect(() => {
    // Derive events for teacher: include personal and broadcast always, filter lessons by viewMode
    // - Always include personal events for the teacher
    // - Always include schoolwide/broadcast events
    // - For lessons: filter based on viewMode ('my_lessons' or 'full_class')
    // - Include other relevant events (assignments, etc.) for classes or assigned to teacher
    const classIds = (classes || []).map((c: any) => c.id).filter(Boolean)
    const derived = (sharedEvents || []).filter((e) => {
      const event = e as Event
      // Always include personal events for the teacher
      if (event.event_type === 'personal' && event.target_user === userId) return true
      // Always include schoolwide/broadcast events
      if (
        event.event_type === 'broadcast' ||
        event.event_type === 'urgent_broadcast' ||
        event.visibility_scope === 'schoolwide'
      ) {
        return true
      }
      // Always show break and prayer events
      if (event.event_type === 'break' || event.event_type === 'prayer') {
        return true
      }

      if (viewMode === 'my_lessons') {
        // In "My Lessons" mode: only show lessons assigned to this teacher
        if (event.event_type === 'lesson') {
          return Boolean(event.teacher_id) && event.teacher_id === userId
        }
        // Don't show other event types in "My Lessons" mode
        return false
      } else if (viewMode === 'full_class') {
        // In "Full Class" mode: show all events for assigned classes
        if (event.target_class && classIds.includes(event.target_class)) return true
        if (event.teacher_id === userId) return true
        return false
      } else if (viewMode === 'personal_schedule') {
        // In "Personal Schedule" mode: only show personal events for the teacher
        return event.event_type === 'personal' && event.target_user === userId
      } else if (viewMode === 'all_schedule') {
        // In "All Schedule" mode: show all events (personal + class + broadcast)
        return true
      }
    }).map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || null,
      event_type: e.event_type,
      start_at: e.start_at,
      end_at: e.end_at || e.start_at,
      location: e.location || null,
      created_by: e.created_by,
      created_by_role: 'teacher' as 'teacher' | 'student' | 'admin',
      target_class: e.target_class || null,
      target_user: (e as Event).target_user || null,
      teacher_id: (e as Event).teacher_id || null,
      visibility_scope: e.visibility_scope,
      metadata: e.metadata || null,
      is_deleted: false,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }))
    setEvents(derived)
    setIsLoading(sharedLoading)
  }, [sharedEvents, userId, sharedLoading, viewMode, classes])

  const handleAddEvent = () => {
    setShowTypeSelector(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowTypeSelector(true)
  }

  const handleEventClick = (event: any) => {
    setShowEventDetails(event as Event)
  }

  const handleEventFormClose = () => {
    setShowEventForm(false)
    setSelectedDate(undefined)
  }

  const handleEventFormSuccess = async () => {
    setShowEventForm(false)
    setSelectedDate(undefined)
    await refresh()
  }

  const handleEventDetailsClose = () => {
    setShowEventDetails(null)
  }

  const handleEventEdit = async () => {
    await refresh()
  }

  const handleEventDelete = async () => {
    setShowEventDetails(null)
    await refresh()
  }

  const handleTypeSelect = (type: 'student' | 'personal') => {
    setSelectedEventType(type)
    setShowTypeSelector(false)
    setShowEventForm(true)
  }

  // Find the current class name to display
  const currentClass = classes.find(c => c.id === classId)
  const getDisplayName = () => {
    switch (viewMode) {
      case 'my_lessons':
        return 'My Lessons'
      case 'full_class':
        return currentClass ? currentClass.name : 'All Classes'
      case 'personal_schedule':
        return 'Personal Schedule'
      case 'all_schedule':
        return 'All Schedule'
      default:
        return 'My Lessons'
    }
  }
  const displayName = getDisplayName()

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>
  }

  return (
    <>
      <div className="text-xl font-bold mb-4">{displayName}</div>
      <EnhancedCalendar
        showFilters={false}
        events={events.map(e => ({
          ...e,
          description: e.description || null,
          end_at: e.end_at || e.start_at,
          created_by_role: (e as Event).created_by_role || 'teacher',
          target_user: (e as Event).target_user || null,
          teacher_id: (e as Event).teacher_id || null,
          is_deleted: (e as Event).is_deleted || false,
          metadata: e.metadata || null,
          location: e.location || null,
        }))}
        onEventClick={(ev) => {
          const mapped = {
            ...(ev as any),
            visibility_scope: (ev as any).visibility_scope ?? 'class',
            created_at: (ev as any).created_at ?? new Date().toISOString(),
            updated_at: (ev as any).updated_at ?? new Date().toISOString(),
            end_at: (ev as any).end_at ?? (ev as any).start_at,
          }
          handleEventClick(mapped as any)
        }}
        onDateClick={handleDateClick}
        onAddEvent={handleAddEvent}
        canAddEvents={true}
      />

      <ScheduleTypeSelectorModal 
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelectType={handleTypeSelect}
      />

      {showEventForm && (
        <EventForm
          onClose={handleEventFormClose}
          onSuccess={handleEventFormSuccess}
          initialDate={selectedDate}
          userRole={userRole}
          userId={userId}
          classId={selectedEventType === 'personal' ? undefined : classId}
          // Teachers should not create lessons from this view; default to assignment for student schedules
          defaultEventType={selectedEventType === 'personal' ? 'personal' : (userRole === 'teacher' ? 'assignment' : 'lesson')}
        />
      )}

      {showEventDetails && (
        <EventDetails
          event={{
            id: showEventDetails.id,
            title: showEventDetails.title,
            description: showEventDetails.description || null,
            event_type: showEventDetails.event_type as 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement',
            start_at: showEventDetails.start_at,
            end_at: showEventDetails.end_at || showEventDetails.start_at,
            location: showEventDetails.location || null,
            created_by: showEventDetails.created_by,
            created_by_role: 'teacher' as const,
            target_class: showEventDetails.target_class || null,
            target_user: null,
            teacher_id: userId,
            visibility_scope: showEventDetails.visibility_scope || 'class',
            metadata: showEventDetails.metadata || null,
            is_deleted: false,
            created_at: showEventDetails.created_at,
            updated_at: showEventDetails.updated_at
          }}
          onClose={handleEventDetailsClose}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          canEdit={showEventDetails.event_type === 'personal' && showEventDetails.created_by === userId}
          canDelete={showEventDetails.event_type === 'personal' && showEventDetails.created_by === userId}
          onVisibilityChange={(scope) => {
            if (!showEventDetails) return
            // The local state will be updated through the API response
          }}
        />
      )}
    </>
  )
}
