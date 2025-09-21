export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboardContent } from "@/components/student/dashboard-content"
import type { Event as EventType } from "@/types/events"

// Type definitions for database responses
interface DatabaseEvent {
  id: string | number
  title?: string
  name?: string
  description?: string
  message?: string
  event_type?: string
  type?: string
  visibility_scope?: string
  scope?: string
  start_at?: string
  created_at?: string
  end_at?: string
  location?: string
  created_by?: string
  user_id?: string
  target_class?: string
  class_id?: string
  subject_id?: string
  metadata?: Record<string, unknown>
  updated_at?: string
}

interface DatabaseNotification {
  id: string
  user_id: string
  created_at: string
  [key: string]: unknown
}

export default async function StudentDashboard() {
  let profile;
  
  try {
    profile = await requireRole(["student"])
    if (!profile) {
      redirect('/auth/login')
    }

    const supabase = await createClient()

    // Run queries in parallel
    const [notificationsResult, eventsResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      
      supabase
        .from("events")
        .select("*")
        .or(`created_by.eq.${profile.id}${profile.class_id ? `,target_class.eq.${profile.class_id}` : ''}`)
        .gte("start_at", new Date().toISOString())
        .order("start_at")
        .limit(6)
    ]).catch(error => {
      console.error("Query execution error:", error)
      return [
        { data: [], error: error },
        { data: [], error: error }
      ]
    });

    // Log any errors that occurred
    if (notificationsResult?.error || eventsResult?.error) {
      console.error("Data fetch errors:", {
        notifications: notificationsResult?.error,
        events: eventsResult?.error,
        profile: {
          id: profile.id,
          class_id: profile.class_id,
          role: profile.role
        }
      });
    }

    // Normalize DB rows to the shared Event type to satisfy TS
    const rawEvents = (eventsResult?.data || []) as DatabaseEvent[]
    const events: EventType[] = rawEvents.map((e: DatabaseEvent) => ({
      id: String(e.id),
      title: e.title || e.name || "",
      description: e.description ?? e.message ?? null as string | null,
      event_type: (e.event_type || e.type || 'lesson') as EventType['event_type'],
      visibility_scope: (e.visibility_scope || e.scope || 'class') as EventType['visibility_scope'],
      start_at: e.start_at || e.created_at || new Date().toISOString(),
      end_at: e.end_at || e.start_at || new Date().toISOString(),
      location: e.location ?? null,
      created_by: e.created_by || e.user_id || '',
      created_by_role: 'student', // Default for student dashboard
      target_class: e.target_class || e.class_id || null,
      target_user: null, // Not applicable for student dashboard
      teacher_id: null, // Not applicable for student dashboard
      subject: e.subject_id,
      metadata: e.metadata ?? null,
      is_deleted: false, // Default for student dashboard
      created_at: e.created_at || new Date().toISOString(),
      updated_at: e.updated_at || new Date().toISOString(),
    }))

    // Sort events by start time
    const allEvents = events.sort((a: EventType, b: EventType) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

    const stats = {
      activeSchedules: allEvents.length,
      todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hasClass: Boolean(profile.class_id)
    }

    return (
      <StudentDashboardContent
        profile={profile}
        notifications={notificationsResult?.data || []}
        events={allEvents}
        assignments={[]}
        subjects={[]}
        stats={stats}
      />
    )

  } catch (error) {
    if (error instanceof Error && error.message !== 'redirect') {
      console.error("StudentDashboard Error:", error)
      return (
        <StudentDashboardContent
          profile={profile ?? { id: '', role: 'student' }}
          notifications={[]}
          events={[]}
          assignments={[]}
          subjects={[]}
          stats={{
            activeSchedules: 0,
            todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            hasClass: false
          }}
        />
      )
    }
    redirect('/auth/login')
  }
}
