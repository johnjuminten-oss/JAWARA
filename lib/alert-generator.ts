import { createClient } from "@/lib/supabase/server"

export async function generateExamReminders() {
  const supabase = await createClient()

  // Find exams happening in the next 24 hours
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: upcomingExams } = await supabase
    .from("events")
    .select("*, profiles!events_created_by_fkey(id, full_name)")
    .eq("event_type", "exam")
    .gte("start_at", new Date().toISOString())
    .lte("start_at", tomorrow.toISOString())

  if (!upcomingExams) return

  for (const exam of upcomingExams) {
    // Check if reminder already sent
    const { data: existingAlert } = await supabase
      .from("alerts")
      .select("id")
      .eq("user_id", exam.created_by)
      .eq("alert_type", "exam_reminder")
      .eq("message", `Exam reminder: ${exam.title} is scheduled for tomorrow`)
      .single()

    if (existingAlert) continue

    // Create exam reminder alert
    await supabase.from("alerts").insert({
      user_id: exam.created_by,
      alert_type: "exam_reminder",
      message: `Exam reminder: ${exam.title} is scheduled for tomorrow at ${new Date(exam.start_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
      delivery: "both",
    })

    // If exam has target class, notify all students in that class
    if (exam.target_class) {
      const { data: students } = await supabase
        .from("profiles")
        .select("id")
        .eq("class_id", exam.target_class)
        .eq("role", "student")

      if (students) {
        for (const student of students) {
          await supabase.from("alerts").insert({
            user_id: student.id,
            alert_type: "exam_reminder",
            message: `Exam reminder: ${exam.title} is scheduled for tomorrow at ${new Date(exam.start_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
            delivery: "both",
          })
        }
      }
    }
  }
}

export async function checkScheduleOverload(userId: string) {
  const supabase = await createClient()

  // Get events for the current week
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  const { data: weekEvents } = await supabase
    .from("events")
    .select("*")
    .or(`created_by.eq.${userId},target_class.in.(select class_id from profiles where id = '${userId}')`)
    .gte("start_at", startOfWeek.toISOString())
    .lt("start_at", endOfWeek.toISOString())

  if (!weekEvents || weekEvents.length < 10) return // Threshold: 10+ events per week

  // Check if overload warning already sent this week
  const { data: existingAlert } = await supabase
    .from("alerts")
    .select("id")
    .eq("user_id", userId)
    .eq("alert_type", "overload_warning")
    .gte("created_at", startOfWeek.toISOString())
    .single()

  if (existingAlert) return

  // Create overload warning
  await supabase.from("alerts").insert({
    user_id: userId,
    alert_type: "overload_warning",
    message: `Schedule overload warning: You have ${weekEvents.length} events scheduled this week. Consider reviewing your schedule to avoid burnout.`,
    delivery: "in_app",
  })
}

export async function detectScheduleConflicts(userId: string, newEventStart: string, newEventEnd: string) {
  const supabase = await createClient()

  // Find overlapping events
  const { data: conflictingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .or(`start_at.lte.${newEventEnd},end_at.gte.${newEventStart}`)

  if (!conflictingEvents || conflictingEvents.length === 0) return

  const hasConflict = conflictingEvents.some((event) => {
    const eventStart = new Date(event.start_at)
    const eventEnd = new Date(event.end_at)
    const newStart = new Date(newEventStart)
    const newEnd = new Date(newEventEnd)

    return (
      (newStart >= eventStart && newStart < eventEnd) ||
      (newEnd > eventStart && newEnd <= eventEnd) ||
      (newStart <= eventStart && newEnd >= eventEnd)
    )
  })

  if (hasConflict) {
    await supabase.from("alerts").insert({
      user_id: userId,
      alert_type: "conflict_alert",
      message: `Schedule conflict detected: Your new event overlaps with existing schedules. Please review and adjust timing.`,
      delivery: "in_app",
    })
  }
}
