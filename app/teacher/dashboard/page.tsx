export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { TeacherDashboardContent } from "@/components/teacher/dashboard-content"

export default async function TeacherDashboard() {
  try {
    const profile = await requireRole(["teacher"])
    if (!profile) {
      redirect('/auth/login')
    }

    const supabase = await createClient()

    // Step 1: fetch notifications and student count in parallel (independent)
    const [notificationsResult, studentCountResult] = await Promise.allSettled([
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*", { count: 'exact' })
        .eq("role", "student")
    ])

    const notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value.data : []
    const studentCount = studentCountResult.status === 'fulfilled' ? studentCountResult.value.data : { count: 0 }

    // Step 2: get class assignments for this teacher from both class_teachers and teacher_assignments
    const [classTeachersRes, teacherAssignmentsRes] = await Promise.all([
      supabase
        .from('class_teachers')
        .select('class_id')
        .eq('teacher_id', profile.id)
        .eq('is_deleted', false),
      supabase
        .from('teacher_assignments')
        .select('class_id')
        .eq('teacher_id', profile.id)
        .eq('is_deleted', false)
    ])

    const derivedClassIds = [
      ...((classTeachersRes as any)?.data || []).map((r: any) => r.class_id),
      ...((teacherAssignmentsRes as any)?.data || []).map((r: any) => r.class_id),
    ].filter(Boolean)

    const classIdSet = new Set<string>(derivedClassIds.map((v: any) => String(v)))
    const classIds = Array.from(classIdSet)

    // Step 3: fetch assigned class rows for display
    let assignedClasses: any[] = []
    if (classIds.length > 0) {
      const { data: cls } = await supabase
        .from('classes')
        .select('*')
        .in('id', classIds)
      assignedClasses = cls || []
    }

    // Step 4: fetch upcoming lesson events assigned to this teacher or assigned by admin to their classes
    const nowIso = new Date().toISOString()
    // Query A: lesson events with teacher_id = this teacher
    const queryATask = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'lesson')
      .eq('teacher_id', profile.id)
      .gte('start_at', nowIso)
      .eq('is_deleted', false)

    // Query B: lesson events created by admin targeting one of the teacher's classes (when we have classIds)
    const queryBTask = classIds.length > 0
      ? supabase
          .from('events')
          .select('*')
          .eq('event_type', 'lesson')
          .eq('created_by_role', 'admin')
          .in('target_class', classIds)
          .gte('start_at', nowIso)
          .eq('is_deleted', false)
      : Promise.resolve({ data: [] } as any)

    // Query C: broadcast/schoolwide events
    const queryCTask = supabase
      .from('events')
      .select('*')
      .or('event_type.eq.broadcast,event_type.eq.urgent_broadcast')
      .gte('start_at', nowIso)
      .eq('is_deleted', false)

    // Query D: personal events for this teacher (all, not just upcoming)
    const queryDTask = supabase
      .from('events')
      .select('*')
      .eq('event_type', 'personal')
      .eq('target_user', profile.id)
      .eq('is_deleted', false)

    const [byTeacherIdRes, adminByClassRes, broadcastRes, personalRes] = await Promise.all([queryATask, queryBTask, queryCTask, queryDTask])

    const mergeArr = [
      (byTeacherIdRes as any)?.data || [],
      (adminByClassRes as any)?.data || [],
      (broadcastRes as any)?.data || [],
      (personalRes as any)?.data || [],
    ].flat()

    const uniqueById = new Map<string, any>()
    for (const ev of mergeArr) {
      if (!ev) continue
      uniqueById.set(String(ev.id), ev)
    }
    const events = Array.from(uniqueById.values()).sort((a: any, b: any) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    // Compute weekly events for the greeting (today -> end of week)
    // Primary source: teacher_calendar_events view (fast). Fallback: count events by class assignments and direct targets.
  let weekEventsCount = 0
  // Debug counters to help trace which branch returned rows
  let viewCount = 0
  let eventsByClassCount = 0
  let eventsByUserCount = 0
  let finalFromPropsCount = 0
    // compute week bounds
    const startOfWeek = new Date()
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date()
    endOfWeek.setDate(startOfWeek.getDate() + (6 - startOfWeek.getDay()))

    // Try RPC via service-role client first (bypass RLS reliably)
    try {
      const { createServiceClient } = await import('@/lib/supabase/server')
      const service = createServiceClient()
      const { data: rpcData, error: rpcErr } = await service.rpc('get_teacher_weekly_count', { p_teacher: profile.id })
      if (!rpcErr && rpcData != null) {
        if (typeof rpcData === 'number') {
          weekEventsCount = rpcData
        } else if (Array.isArray(rpcData) && rpcData.length > 0) {
          const first = rpcData[0]
          if (typeof first === 'number') weekEventsCount = first
          else if (first && typeof first === 'object') {
            const vals = Object.values(first)
            const num = vals.find(v => typeof v === 'number')
            if (typeof num === 'number') weekEventsCount = num
          }
        } else if (rpcData && typeof rpcData === 'object' && Object.values(rpcData).length > 0) {
          const num = Object.values(rpcData).find(v => typeof v === 'number')
          if (typeof num === 'number') weekEventsCount = num
        }
      }
    } catch (rpcErr) {
      // ignore rpc failure and fall back to view/fallback logic
    }

    // If RPC didn't populate the count, fall back to previous view + queries
    if (!weekEventsCount) {
      try {
        const { data: weekRes, error: weekErr } = await supabase
          .from('teacher_calendar_events')
          .select('*')
          .eq('teacher_id', profile.id)
          .gte('start_at', startOfWeek.toISOString())
          .lte('start_at', endOfWeek.toISOString())

        if (!weekErr && weekRes && weekRes.length > 0) {
          weekEventsCount = weekRes.length
          viewCount = weekRes.length
        } else {
          // Fallback: fetch class ids assigned to this teacher, then count events targeted to those classes
          try {
            const { data: classRows } = await supabase
              .from('class_teachers')
              .select('class_id')
              .eq('teacher_id', profile.id)

            const classIds = (classRows || []).map((r: any) => r.class_id).filter(Boolean)

            // Collect IDs from multiple queries then deduplicate
            const idSet = new Set<string>()

            if (classIds.length > 0) {
              const { data: eventsByClass } = await supabase
                .from('events')
                .select('id')
                .in('target_class', classIds)
                .gte('start_at', startOfWeek.toISOString())
                .lte('start_at', endOfWeek.toISOString())
                .eq('is_deleted', false)

              const arr = (eventsByClass || []).map((r: any) => String(r.id))
              arr.forEach((id) => idSet.add(id))
              eventsByClassCount = arr.length
            }

            // Events targeted directly to this teacher/user
            const { data: eventsByUser } = await supabase
              .from('events')
              .select('id')
              .eq('target_user', profile.id)
              .gte('start_at', startOfWeek.toISOString())
              .lte('start_at', endOfWeek.toISOString())
              .eq('is_deleted', false)

            const arrUser = (eventsByUser || []).map((r: any) => String(r.id))
            arrUser.forEach((id) => idSet.add(id))
            eventsByUserCount = arrUser.length

            // Events created by this teacher
            const { data: eventsByCreator } = await supabase
              .from('events')
              .select('id')
              .eq('created_by', profile.id)
              .gte('start_at', startOfWeek.toISOString())
              .lte('start_at', endOfWeek.toISOString())
              .eq('is_deleted', false)

            const arrCreator = (eventsByCreator || []).map((r: any) => String(r.id))
            arrCreator.forEach((id) => idSet.add(id))

            // Schoolwide events
            const { data: eventsSchool } = await supabase
              .from('events')
              .select('id')
              .in('visibility_scope', ['all','schoolwide'])
              .gte('start_at', startOfWeek.toISOString())
              .lte('start_at', endOfWeek.toISOString())
              .eq('is_deleted', false)

            const arrSchool = (eventsSchool || []).map((r: any) => String(r.id))
            arrSchool.forEach((id) => idSet.add(id))

            // Assign counts
            eventsByUserCount = eventsByUserCount || 0
            eventsByClassCount = eventsByClassCount || 0
            // weekEventsCount is unique ID count
            weekEventsCount = idSet.size
          } catch (innerErr) {
            console.error('Fallback fetch for teacher weekly events failed:', innerErr)
          }
        }
      } catch (e) {
        console.error('Error fetching teacher weekly events:', e)
      }
    }

    // Final fallback: if we still have zero, compute from the already-fetched `events` and `assignedClasses`.
    // This helps in dev environments where migrations/views may not be applied yet.
    try {
      if (weekEventsCount === 0) {
        const startOfWeek = new Date()
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date()
        endOfWeek.setDate(startOfWeek.getDate() + (6 - startOfWeek.getDay()))

        const classIds = (assignedClasses || []).map((c: any) => c.id).filter(Boolean)

        const countFromEvents = (events || []).filter((e: any) => {
          try {
            if (e.is_deleted) return false
            const s = new Date(e.start_at)
            if (s < startOfWeek || s > endOfWeek) return false
            if (e.target_user === profile.id) return true
            if (e.target_class && classIds.includes(e.target_class)) return true
            return false
          } catch (err) {
            return false
          }
        }).length
        finalFromPropsCount = countFromEvents
        weekEventsCount = countFromEvents
      }
    } catch (fallbackErr) {
      console.error('Final fallback counting failed:', fallbackErr)
    }

    // Emit a concise debug line so server logs show which branches had counts
    try {
      console.log(`teacher_dashboard_counts teacher=${profile.id} view=${viewCount} byClass=${eventsByClassCount} byUser=${eventsByUserCount} finalFromProps=${finalFromPropsCount} selected=${weekEventsCount}`)
    } catch (logErr) {
      // non-fatal
    }

    // Compute students only from assigned classes for teacher dashboards
    let totalStudents = 0
    try {
      if (classIds.length > 0) {
        const { data: studentRows } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'student')
          .in('class_id', classIds)
        totalStudents = Array.isArray(studentRows) ? studentRows.length : (studentCount && 'count' in studentCount ? studentCount.count : 0)
      }
    } catch {}

    const stats = {
      activeSchedules: weekEventsCount,
      todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      totalStudents,
      totalClasses: assignedClasses?.length || 0
    }

    return (
      <TeacherDashboardContent
        profile={profile}
        notifications={notifications || []}
        events={events || []}
        classes={assignedClasses || []}
        stats={stats}
      />
    )
  } catch (error) {
    console.error("TeacherDashboard Error:", error)
    redirect('/auth/login')
  }
}
