import { createClient } from "@/lib/supabase/client"

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  event_type: "lesson" | "exam" | "assignment" | "personal" | "broadcast"
  created_by: string
  target_class?: string
  creator_name?: string
  creator_role?: string
  class_name?: string
}

export async function fetchStudentSchedule(userId: string, classId?: string) {
  const supabase = createClient()

  try {
    // First fetch class info if classId is provided
    let classInfo = null
    if (classId) {
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          batches (
            id,
            name
          )
        `)
        .eq("id", classId)
        .single()

      if (classError) throw classError
      classInfo = classData
    }

    // Fetch all relevant events in a single query
    const { data: events, error: eventsError } = await supabase
      .rpc('get_student_schedule', { student_id: userId })

    if (eventsError) throw eventsError

    return {
      events: events || [],
      classInfo
    }
  } catch (error) {
    console.error("Error fetching student schedule:", error)
    throw error
  }
}

export async function subscribeToScheduleUpdates(
  userId: string,
  classId: string | undefined,
  onUpdate: (events: ScheduleEvent[]) => void
) {
  const supabase = createClient()

  // Subscribe to events table changes
  const subscription = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: classId ? `target_class=eq.${classId}` : undefined
      },
      async () => {
        // Refetch all events when any change occurs
        const { events } = await fetchStudentSchedule(userId, classId)
        onUpdate(events)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
