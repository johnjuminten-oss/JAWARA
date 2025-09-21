"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { X } from "lucide-react"
import { useState } from "react"
import { VisibilityScope, Event } from "@/types/database"
import { EventVisibility } from "./event-visibility"

interface EventFormProps {
  onClose: () => void
  onSuccess: () => void
  initialDate?: Date
  userRole: string
  userId: string
  classId?: string
  defaultEventType?: 'lesson' | 'exam' | 'assignment' | 'regular_study' | 'academic_notes' | 
    'break' | 'prayer' | 'sports' | 'arts' | 'administrative' | 
    'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
  // existing event data for editing mode
  existingEvent?: {
    id: string
    title: string
    description: string | null
    event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
    start_at: string
    end_at: string
    location: string | null
    created_by: string
    created_by_role: 'admin' | 'teacher' | 'student'
    target_class: string | null
    target_user: string | null
    teacher_id: string | null
    visibility_scope: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
    metadata?: Record<string, any> | null
    is_deleted?: boolean
    created_at: string
    updated_at: string
  }
  // optional classes list for admin to choose target class
  classes?: { id: string; name: string; batch_name?: string }[]
  // optional teachers list for admin to assign specific teachers
  teachers?: { id: string; full_name: string; email?: string }[]
}

export function EventForm(props: EventFormProps) {
  const {
    onClose,
    onSuccess,
    initialDate,
    userRole,
    userId,
    classId,
    defaultEventType,
    classes,
    teachers,
  } = props
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allDay, setAllDay] = useState(false)
  
  const formatDateForInput = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const formatTimeForInput = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }
  const [formData, setFormData] = useState<{
    title: string
    description: string
    start_date: string
    start_time: string
    end_date: string
    end_time: string
    location: string
    event_type: 'lesson' | 'exam' | 'assignment' | 'regular_study' | 'academic_notes' | 
      'break' | 'prayer' | 'sports' | 'arts' | 'administrative' | 
      'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
    visibility_scope: VisibilityScope
    target_class?: string
    teacher_id: string
  }>(() => {
    if (props.existingEvent) {
      const startDate = new Date(props.existingEvent.start_at)
      const endDate = new Date(props.existingEvent.end_at)
      return {
        title: props.existingEvent.title,
        description: props.existingEvent.description || "",
        start_date: formatDateForInput(startDate),
        start_time: formatTimeForInput(startDate),
        end_date: formatDateForInput(endDate),
        end_time: formatTimeForInput(endDate),
        location: props.existingEvent.location || "",
        event_type: props.existingEvent.event_type as 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast',
        visibility_scope: props.existingEvent.visibility_scope,
        target_class: props.existingEvent.target_class || classId || "",
        teacher_id: props.existingEvent.teacher_id || "none",
      }
    }
    
    return {
      title: "",
      description: "",
      start_date: initialDate ? formatDateForInput(initialDate) : "",
      start_time: initialDate ? formatTimeForInput(initialDate) : "",
      end_date: initialDate ? formatDateForInput(initialDate) : "",
      end_time: initialDate ? (() => { const d = new Date(initialDate); d.setHours(d.getHours()+1); return formatTimeForInput(d) })() : "",
      location: "",
      // Teachers should not default to creating lessons. Default to assignment for teachers.
      event_type: defaultEventType || (userRole === "student" ? "personal" : (userRole === "teacher" ? "assignment" : "lesson")),
      visibility_scope: userRole === "student" ? "personal" : "class",
      target_class: classId || "",
      teacher_id: "none",
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Combine date and time
      // Build local date-times explicitly to avoid timezone jumps
      const toLocalDate = (dateStr: string, timeStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        const [hh, mm] = timeStr.split(':').map(Number)
        return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
      }

      const startDateTime = allDay
        ? toLocalDate(formData.start_date, "00:00")
        : toLocalDate(formData.start_date, formData.start_time)
      const endDateTime = allDay
        ? toLocalDate(formData.end_date, "23:59")
        : toLocalDate(formData.end_date, formData.end_time)

      // Validate dates
      if (startDateTime >= endDateTime) {
        throw new Error("End time must be after start time")
      }

      // Check for conflicts (exclude current event when editing)
      let conflictQuery = supabase
        .from("events")
        .select("*")
        .eq("created_by", userId)
        .or(`start_at.lte.${endDateTime.toISOString()},end_at.gte.${startDateTime.toISOString()}`)

      if (props.existingEvent) {
        conflictQuery = conflictQuery.neq("id", props.existingEvent.id)
      }

      const { data: existingEvents } = await conflictQuery

      if (existingEvents && existingEvents.length > 0) {
        const hasConflict = existingEvents.some((event) => {
          const eventStart = new Date(event.start_at)
          const eventEnd = new Date(event.end_at)
          return (
            (startDateTime >= eventStart && startDateTime < eventEnd) ||
            (endDateTime > eventStart && endDateTime <= eventEnd) ||
            (startDateTime <= eventStart && endDateTime >= eventEnd)
          )
        })

        if (hasConflict) {
          setError("This event conflicts with an existing schedule. Please choose a different time.")
          setIsLoading(false)
          return
        }
      }

      const authUserId = userId || (await supabase.auth.getUser()).data.user?.id

      const eventData = {
        title: formData.title,
        description: formData.description,
        start_at: startDateTime.toISOString(),
        end_at: endDateTime.toISOString(),
        location: formData.location || null,
        event_type: formData.event_type,
        target_class: formData.event_type === "personal" ? null : (formData.target_class || classId || null),
        target_user: formData.event_type === "personal" ? userId : null,
        teacher_id: formData.teacher_id === "none" || !formData.teacher_id ? null : formData.teacher_id,
        visibility_scope: formData.event_type === "personal" ? "personal" : formData.visibility_scope,
      }

      let error
      if (props.existingEvent) {
        // Update existing event
        const { error: updateError } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", props.existingEvent.id)
        error = updateError
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from("events")
          .insert({
            ...eventData,
            created_by: authUserId,
            created_by_role: userRole,
          })
        error = insertError
      }

      if (error) throw error

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold">{props.existingEvent ? "Edit Event" : "Add New Event"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Basic Information</Label>
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs text-gray-600">Title *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs text-gray-600">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description (optional)"
                    rows={1}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </div>

              {/* Date & Time Section */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Date & Time</Label>
                <div className="flex items-center mb-2">
                  <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} aria-label="Toggle all day event" />
                  <Label htmlFor="all-day" className="ml-2 text-xs text-gray-700">All day</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="start_date" className="text-xs text-gray-600">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end_date" className="text-xs text-gray-600">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  {!allDay && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="start_time" className="text-xs text-gray-600">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          required
                          value={formData.start_time}
                          onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="end_time" className="text-xs text-gray-600">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          required
                          value={formData.end_time}
                          onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                          className="h-8 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Details</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-xs text-gray-600">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Room 101, Online, etc."
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="event_type" className="text-xs text-gray-600">Event Type</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value: typeof formData.event_type) =>
                        setFormData((prev) => ({ ...prev, event_type: value }))
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRole === "student" && (
                          <SelectItem value="personal">Personal</SelectItem>
                        )}
                        {userRole === "teacher" && (
                          <>
                            {/* Academic events */}
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="regular_study">Regular Study</SelectItem>
                            <SelectItem value="academic_notes">Academic Notes</SelectItem>
                            
                            {/* Activities */}
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="administrative">Administrative</SelectItem>
                            
                            {/* Personal */}
                            <SelectItem value="personal">Personal</SelectItem>
                          </>
                        )}
                        {userRole === "admin" && (
                          <>
                            {/* Academic events */}
                            <SelectItem value="lesson">Lesson</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="regular_study">Regular Study</SelectItem>
                            <SelectItem value="academic_notes">Academic Notes</SelectItem>
                            
                            {/* School activities */}
                            <SelectItem value="break">Break</SelectItem>
                            <SelectItem value="prayer">Prayer</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="administrative">Administrative</SelectItem>
                            
                            {/* Other */}
                            <SelectItem value="personal">Personal</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Target class, teacher, and visibility in compact grid */}
                <div className="grid grid-cols-2 gap-2">
                  {userRole !== "student" && classes && (
                    <div className="space-y-1">
                      <Label htmlFor="target_class" className="text-xs text-gray-600">Target Class</Label>
                      <Select
                        value={formData.target_class}
                        onValueChange={(value: string) => setFormData((prev) => ({ ...prev, target_class: value }))}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}{c.batch_name ? ` (${c.batch_name})` : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {userRole === "admin" && teachers && teachers.length > 0 && (
                    <div className="space-y-1">
                      <Label htmlFor="teacher_id" className="text-xs text-gray-600">Assign Teacher (Optional)</Label>
                      <Select
                        value={formData.teacher_id}
                        onValueChange={(value: string) => setFormData((prev) => ({ ...prev, teacher_id: value }))}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific teacher</SelectItem>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}


                  <div className="space-y-1">
                    <Label htmlFor="visibility" className="text-xs text-gray-600">Visibility</Label>
                    <Select
                      value={formData.visibility_scope}
                      onValueChange={(value: VisibilityScope) =>
                        setFormData((prev) => ({ ...prev, visibility_scope: value }))
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        {userRole !== "student" && (
                          <>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="schoolwide">School-wide</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">{error}</div>}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-8 text-sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 h-8 text-sm">
                  {isLoading ? (props.existingEvent ? "Saving..." : "Creating...") : (props.existingEvent ? "Save Changes" : "Create Event")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
