"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { EventForm } from "@/components/schedule/event-form"
import type { Event } from "@/types/database"
import { Plus, Trash2, Edit, Calendar, Clock, Repeat } from "lucide-react"
import { useEffect, useState } from "react"

interface Batch {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
  batch_id: string
}

interface Schedule {
  id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  location: string | null
  event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
  target_class: string | null
  created_by: string
  created_by_role: 'admin' | 'teacher' | 'student'
  created_at: string
  updated_at: string
  is_recurring?: boolean
  repeat_until?: string
  visibility_scope?: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
  metadata?: Record<string, any> | null
  is_deleted?: boolean
  teacher_id?: string | null
  target_user?: string | null
}

interface ScheduleForm {
  title: string
  description: string
  start_at: string
  end_at: string
  location: string
  event_type: string
  target_class: string
  is_recurring: boolean
  repeat_until: string
}

export function ScheduleManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [teachers, setTeachers] = useState<{ id: string; full_name: string; email: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [viewType, setViewType] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewSearch, setViewSearch] = useState("")
  const [formData, setFormData] = useState<ScheduleForm>({
    title: "",
    description: "",
    start_at: "",
    end_at: "",
    location: "",
    event_type: "lesson",
    target_class: "",
    is_recurring: false,
    repeat_until: "",
  })

  const eventTypes = [
    { value: "lesson", label: "Lesson" },
    { value: "exam", label: "Exam" },
    { value: "assignment", label: "Assignment" },
    { value: "personal", label: "Personal" },
    { value: "broadcast", label: "Broadcast" },
  ]

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [{ data: batchesData }, { data: classesData }, { data: schedulesData }, { data: teachersData }] = await Promise.all([
        supabase.from("batches").select("*").order("name"),
        supabase.from("classes").select("*").order("name"),
        supabase.from("events").select("*").order("start_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email").eq("role", "teacher").order("full_name")
      ])

      setBatches(batchesData || [])
      setClasses(classesData || [])
      setSchedules(schedulesData || [])
      setTeachers(teachersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_at: "",
      end_at: "",
      location: "",
      event_type: "lesson",
      target_class: "",
      is_recurring: false,
      repeat_until: "",
    })
    setEditingSchedule(null)
  }

  const generateRecurringEvents = (baseEvent: any, repeatUntil: string) => {
    const events = []
    const startDate = new Date(baseEvent.start_at)
    const endDate = new Date(baseEvent.end_at)
    const repeatUntilDate = new Date(repeatUntil)
    
    let currentStart = new Date(startDate)
    let currentEnd = new Date(endDate)
    
    while (currentStart <= repeatUntilDate) {
      events.push({
        ...baseEvent,
        start_at: currentStart.toISOString(),
        end_at: currentEnd.toISOString(),
        is_recurring: true,
        repeat_until: repeatUntil,
      })
      
      // Add 7 days (1 week)
      currentStart.setDate(currentStart.getDate() + 7)
      currentEnd.setDate(currentEnd.getDate() + 7)
    }
    
    return events
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const supabase = createClient()
      
      if (editingSchedule) {
        // Update existing schedule
        const updateData = {
          title: formData.title,
          description: formData.description,
          start_at: formData.start_at,
          end_at: formData.end_at,
          location: formData.location,
          event_type: formData.event_type,
          target_class: formData.target_class,
        }
        const result = await supabase
          .from("events")
          .update(updateData)
          .eq("id", editingSchedule.id)
          .select()

        if (result.error) {
          console.error("Supabase update error:", result)
          throw new Error(result.error.message || JSON.stringify(result.error))
        }
      } else {
        // Create new schedule(s)
        const baseEvent = {
          title: formData.title,
          description: formData.description,
          start_at: formData.start_at,
          end_at: formData.end_at,
          location: formData.location,
          event_type: formData.event_type,
          target_class: formData.target_class,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }

        if (formData.is_recurring && formData.repeat_until) {
          // Create recurring events
          const events = generateRecurringEvents(baseEvent, formData.repeat_until)
          
          // Insert all recurring events
          const result = await supabase.from("events").insert(events).select()

          if (result.error) {
            console.error("Supabase insert (recurring) error:", result)
            throw new Error(result.error.message || JSON.stringify(result.error))
          }

          alert(`Successfully created ${Array.isArray(result.data) ? result.data.length : events.length} recurring events!`)
        } else {
          // Create single event
          const result = await supabase.from("events").insert([baseEvent]).select()

          if (result.error) {
            console.error("Supabase insert (single) error:", result)
            throw new Error(result.error.message || JSON.stringify(result.error))
          }
        }
      }

      resetForm()
      setIsDialogOpen(false)
      fetchData()
    } catch (error: any) {
      // Improved error display: prefer message, else stringify the object
      console.error("Error saving schedule:", error)
      const message = error?.message || (typeof error === "object" ? JSON.stringify(error) : String(error))
      alert(`Failed to save schedule: ${message}`)
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      start_at: schedule.start_at.slice(0, 16), // Format for datetime-local input
      end_at: schedule.end_at.slice(0, 16),
      location: schedule.location || "",
      event_type: schedule.event_type,
      target_class: schedule.target_class || "",
      is_recurring: schedule.is_recurring || false,
      repeat_until: schedule.repeat_until ? schedule.repeat_until.slice(0, 10) : "", // Format for date input
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("events").delete().eq("id", scheduleId)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error("Error deleting schedule:", error)
      alert("Failed to delete schedule. Please try again.")
    }
  }

  const getClassName = (classId: string | null) => {
    if (!classId) return "No Class";
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "Unknown Class"
  }

  const getEventTypeLabel = (eventType: string) => {
    const type = eventTypes.find((t) => t.value === eventType)
    return type?.label || eventType
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Schedule Management</h2>
          <p className="text-gray-600">Manage schedules for all classes. Students and teachers will see these schedules.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
          </Dialog>

          {/* Render EventForm directly when open so it can be full-screen and not constrained by DialogContent */}
          {isDialogOpen && (
            <EventForm
              onClose={() => setIsDialogOpen(false)}
              onSuccess={() => { setIsDialogOpen(false); fetchData() }}
              userRole="admin"
              userId={""}
              classId={editingSchedule?.target_class || undefined}
              classes={classes.map(c => ({ id: c.id, name: c.name, batch_name: batches.find(b => b.id === c.batch_id)?.name }))}
              teachers={teachers}
              existingEvent={editingSchedule ? {
                ...editingSchedule,
                target_user: editingSchedule.target_user || null,
                teacher_id: editingSchedule.teacher_id || null,
                metadata: editingSchedule.metadata || null,
                is_deleted: editingSchedule.is_deleted || false,
                visibility_scope: editingSchedule.visibility_scope || 'all'
              } : undefined}
              defaultEventType={editingSchedule?.event_type === 'urgent_broadcast' || editingSchedule?.event_type === 'class_announcement' 
                ? 'broadcast' 
                : editingSchedule?.event_type as 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast'}
            />
          )}
      </div>

      {/* Schedules grouped by event type (cards) */}
      <div>
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              All Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* larger cards for readability: two columns on large screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {eventTypes.map((type) => {
                const items = schedules.filter((s) => s.event_type === type.value)
                return (
                  <Card key={type.value} className="min-h-64 bg-white shadow-sm border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{type.label}</span>
                          <span className="text-sm text-gray-500">({items.length})</span>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm" onClick={() => { setViewType(type.value); setIsViewDialogOpen(true) }}>
                            View all
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={items.length >= 7 ? "max-h-96 overflow-y-auto space-y-3 p-3" : "space-y-3 p-3"}>
                        {items.length === 0 && (
                          <div className="text-sm text-gray-500">No events for this type.</div>
                        )}

                        {items.map((schedule) => (
                          <div key={schedule.id} className="flex items-start justify-between p-3 border rounded-md bg-white">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{schedule.title}</div>
                              <div className="text-xs text-gray-500">
                                {getClassName(schedule.target_class)} • {new Date(schedule.start_at).toLocaleDateString()} {new Date(schedule.start_at).toLocaleTimeString()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{schedule.location || '—'}</div>
                            </div>
                            <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-1">
                              <div>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(schedule)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                              <div>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Catch-all for unknown event types */}
              {(() => {
                const known = new Set(eventTypes.map((t) => t.value))
                const others = schedules.filter((s) => !known.has(s.event_type))
                if (others.length === 0) return null
                return (
                  <Card key="others">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Other</span>
                          <span className="text-sm text-gray-500">({others.length})</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={others.length >= 7 ? "max-h-80 overflow-y-auto space-y-2" : "space-y-2"}>
                        {others.map((schedule) => (
                          <div key={schedule.id} className="flex items-start justify-between p-2 border rounded-md">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{schedule.title}</div>
                              <div className="text-xs text-gray-500">
                                {getClassName(schedule.target_class)} • {new Date(schedule.start_at).toLocaleDateString()} {new Date(schedule.start_at).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2 flex flex-col items-end space-y-1">
                              <div>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(schedule)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                              <div>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* View All Dialog (filtered by event type) */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => { if (!open) setViewType(null); setIsViewDialogOpen(open) }}>
        {/* Make dialog width fit content but limit max width; prevent horizontal overflow on the dialog itself */}
  {/* make dialog wider up to 1600px (or viewport width) so table shows fully */}
  <DialogContent className="sm:max-w-none sm:w-[min(1920px,98vw)] w-screen max-h-[95vh] h-[95vh] overflow-auto">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full gap-4">
              <div>
                <DialogTitle className="text-lg font-semibold">{viewType ? getEventTypeLabel(viewType) : 'Events'}</DialogTitle>
                <div className="text-sm text-gray-500">{(schedules.filter(s => s.event_type === viewType) || []).length} events</div>
              </div>
              <div className="flex items-center gap-3">
                <Input placeholder="Search title..." value={viewSearch} onChange={(e) => setViewSearch(e.target.value)} className="w-80" />
                <Button variant="outline" size="sm" onClick={() => { setIsViewDialogOpen(false); setViewType(null); setViewSearch("") }}>Close</Button>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6">
            <div className="rounded-md border w-full bg-white">
              <div className="overflow-y-auto overflow-x-auto max-h-[88vh] w-full">
                <Table className="table-auto min-w-[1400px] text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-normal">Title</TableHead>
                      <TableHead className="whitespace-normal">Class</TableHead>
                      <TableHead className="whitespace-normal">Date & Time</TableHead>
                      <TableHead className="whitespace-normal">Location</TableHead>
                      <TableHead className="whitespace-normal">Recurring</TableHead>
                      <TableHead className="text-right whitespace-normal">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(
                      (schedules.filter(s => s.event_type === viewType) || [])
                        .filter(s => s.title.toLowerCase().includes(viewSearch.toLowerCase()))
                    ).map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium break-words whitespace-normal">{schedule.title}</TableCell>
                        <TableCell className="break-words whitespace-normal">{getClassName(schedule.target_class)}</TableCell>
                        <TableCell className="break-words whitespace-normal">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{new Date(schedule.start_at).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">{new Date(schedule.start_at).toLocaleTimeString()} - {new Date(schedule.end_at).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="break-words whitespace-normal">{schedule.location || '—'}</TableCell>
                        <TableCell className="break-words whitespace-normal">
                          {schedule.is_recurring ? (
                            <div className="flex items-center space-x-1">
                              <Repeat className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Weekly</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">One-time</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {((schedules.filter(s => s.event_type === viewType) || []).filter(s => s.title.toLowerCase().includes(viewSearch.toLowerCase()))).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">No events found for this type.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
