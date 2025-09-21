// Utility functions for Supabase queries
import { createClient } from '@/lib/supabase/server'
import { Event, Profile, Assignment, Notification, Subject } from '@/types'

// Normalize various error shapes into a plain, serializable object so logging
// and downstream consumers don't receive opaque `{}` values.
function normalizeError(err: any) {
  if (!err) return null
  if (typeof err === 'string') return { message: err }
  if (err instanceof Error) return { message: err.message, stack: err.stack }
  // Supabase error objects often contain message, details, code.
  try {
    return {
      message: err.message ?? (err.error || JSON.stringify(err)),
      details: err.details ?? null,
      code: err.code ?? null
    }
  } catch (e) {
    return { message: String(err) }
  }
}

export async function fetchDashboardData(profile: Profile) {
  const supabase = await createClient()

  try {
    const [notificationsResult, eventsResult, assignmentsResult, subjectsResult] = await Promise.all([
      // Fetch notifications
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .eq("status", "unread")
        .order("created_at", { ascending: false }),
      
      // Fetch events (do NOT rely on PostgREST implicit FK expansion for subjects)
      supabase
        .from("events")
        .select(`*`)
        .gte("start_at", new Date().toISOString())
        .order("start_at")
        .limit(10),
      
      // Fetch assignments if student and we have a class_id (avoid implicit FK expansion)
      profile.role === 'student' && profile.class_id
        ? supabase
            .from("assignments")
            .select(`*`)
            .eq("class_id", profile.class_id)
            .gte("due_date", new Date().toISOString())
        : null,

      // Fetch subjects for the user's class only when class_id exists
      profile.class_id
        ? supabase
            .from("subjects")
            .select(`*, class_subjects!inner(*)`)
            .eq("class_subjects.class_id", profile.class_id)
        : null
    ])

  // Merge subject name into events where possible (avoid DB relationship expansion)
  const eventsData = eventsResult?.data || []
  const subjectsData = subjectsResult?.data || []

  // Aggregate any errors from the parallel queries into a structured, serializable object
  const errors: Record<string, any> = {}
  if (notificationsResult?.error) errors.notifications = normalizeError(notificationsResult.error)
  if (eventsResult?.error) errors.events = normalizeError(eventsResult.error)
  if (assignmentsResult?.error) errors.assignments = normalizeError(assignmentsResult.error)
  if (subjectsResult?.error) errors.subjects = normalizeError(subjectsResult.error)

  const eventsWithSubject = eventsData.map((e: any) => {
      const subj = subjectsData.find((s: any) => s.id === e.subject_id)
      return {
        ...e,
        subject: subj ? { name: subj.name } : null,
      }
    })

    // Also fetch events for the current week so the dashboard can show "this week" stats
    let weekEventsData: any[] = []
    try {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      if (profile.role === 'student') {
        // Try the expected column name first, but fall back to 'subject_id'
        // for older/renamed view schemas where student_id was renamed.
        const tryQuery = async (col: string) => {
          return supabase
            .from('student_calendar_events')
            .select('*')
            .eq(col, profile.id)
            .gte('start_at', startOfWeek.toISOString())
            .lt('start_at', endOfWeek.toISOString())
        }

        let studentWeekResp: any = null
        try {
          studentWeekResp = await tryQuery('student_id')
          if (studentWeekResp.error && studentWeekResp.error.code === '42703') {
            // column missing in view, retry with legacy/alternate name
            studentWeekResp = await tryQuery('subject_id')
          }
        } catch (e) {
          studentWeekResp = { data: null, error: e }
        }

        if (studentWeekResp?.error) {
          errors.week = normalizeError(studentWeekResp.error)
        } else {
          weekEventsData = studentWeekResp.data || []
        }
      } else if (profile.role === 'teacher') {
        const { data: weekRes, error: weekErr } = await supabase
          .from('teacher_calendar_events')
          .select('*')
          .eq('teacher_id', profile.id)
          .gte('start_at', startOfWeek.toISOString())
          .lt('start_at', endOfWeek.toISOString())

        if (weekErr) {
          errors.week = normalizeError(weekErr)
        } else {
          weekEventsData = weekRes || []
        }
      }
    } catch (e) {
      console.error('Error fetching weekly events:', e)
      errors.week = normalizeError(e)
    }

    // If assignments were fetched, fetch related submissions separately and merge
    let assignmentsData: any[] = []
    if (assignmentsResult && assignmentsResult.data) {
      assignmentsData = assignmentsResult.data
      try {
        const assignmentIds = assignmentsData.map((a: any) => a.id).filter(Boolean)
        if (assignmentIds.length > 0) {
          const { data: submissionsForAssignments, error: subsErr } = await supabase
            .from('submissions')
            .select('id, assignment_id, submitted_at, points_earned, student_id')
            .in('assignment_id', assignmentIds)

          if (subsErr) {
            // attach to errors under assignments
            errors.assignments = normalizeError(subsErr)
          } else {
            // group submissions by assignment_id
            const byAssignment: Record<string, any[]> = {}
            ;(submissionsForAssignments || []).forEach((s: any) => {
              byAssignment[s.assignment_id] = byAssignment[s.assignment_id] || []
              byAssignment[s.assignment_id].push(s)
            })

            // merge into assignments
            assignmentsData = assignmentsData.map((a: any) => ({
              ...a,
              submissions: byAssignment[a.id] || []
            }))
          }
        }
      } catch (e) {
        console.error('Error fetching submissions for assignments:', e)
        errors.assignments = normalizeError(e)
      }
    }

  const aggregatedError = Object.keys(errors).length ? errors : null
  if (aggregatedError) console.error("Dashboard query errors:", JSON.stringify(aggregatedError, null, 2))

    return {
      notifications: notificationsResult?.data || [],
      events: eventsWithSubject,
  weekEvents: weekEventsData,
      assignments: assignmentsData,
      subjects: subjectsData,
      error: aggregatedError,
      error_summary: aggregatedError
        ? Object.entries(aggregatedError)
            .map(([k, v]) => `${k}: ${v?.message ?? JSON.stringify(v)}`)
            .join('; ')
        : null
    }
  } catch (err) {
    console.error("Query execution error:", err)
    const payload = normalizeError(err)
    return {
      notifications: [],
      events: [],
      assignments: [],
      subjects: [],
      error: payload,
      error_summary: payload ? payload.message : String(payload)
    }
  }
}

export async function fetchTeacherDashboardData(profile: Profile) {
  const supabase = await createClient()

  try {
    const [notificationsResult, eventsResult, classesResult] = await Promise.all([
      // Fetch notifications
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .eq("status", "unread")
        .order("created_at", { ascending: false }),
      
      // Fetch events (avoid implicit subject expansion)
      supabase
        .from("events")
        .select(`*, class:classes(name)`)
        .or(`created_by.eq.${profile.id},and(target_user.eq.${profile.id},event_type.eq.personal)`)
        .gte("start_at", new Date().toISOString())
        .order("start_at"),
      
      // Fetch assigned classes
      supabase
        .from("class_subjects")
        .select(`
          *,
          class:classes(*),
          subject:subjects(*)
        `)
        .eq("teacher_id", profile.id)
    ])

  // Aggregate errors for teacher dashboard as well (normalize to plain objects)
  const tErrors: Record<string, any> = {}
  if (notificationsResult?.error) tErrors.notifications = normalizeError(notificationsResult.error)
  if (eventsResult?.error) tErrors.events = normalizeError(eventsResult.error)
  if (classesResult?.error) tErrors.classes = normalizeError(classesResult.error)

  const teacherAggregatedError = Object.keys(tErrors).length ? tErrors : null
  if (teacherAggregatedError) console.error("Teacher dashboard query errors:", JSON.stringify(teacherAggregatedError, null, 2))

    return {
      notifications: notificationsResult?.data || [],
      events: eventsResult?.data || [],
      classes: classesResult?.data || [],
      error: teacherAggregatedError,
      error_summary: teacherAggregatedError
        ? Object.entries(teacherAggregatedError)
            .map(([k, v]) => `${k}: ${v?.message ?? JSON.stringify(v)}`)
            .join('; ')
        : null
    }
  } catch (err) {
    console.error("Query execution error:", err)
    const payload = normalizeError(err)
    return {
      notifications: [],
      events: [],
      classes: [],
      error: payload,
      error_summary: payload ? payload.message : String(payload)
    }
  }
}
