export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboardContent } from "@/components/student/dashboard-content"
import type { Event as EventType } from "@/types"

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
    const rawEvents = (eventsResult?.data || []) as any[]
    const events: EventType[] = rawEvents.map((e) => ({
      id: String(e.id),
      title: e.title || e.name || "",
      description: e.description ?? e.message ?? undefined,
      event_type: (e.event_type || e.type || 'lesson') as any,
      visibility_scope: (e.visibility_scope || e.scope || 'class') as any,
      start_at: e.start_at || e.created_at || new Date().toISOString(),
      end_at: e.end_at,
      location: e.location,
      created_by: e.created_by || e.user_id || '',
      target_class: e.target_class || e.class_id || undefined,
      subject_id: e.subject_id,
      metadata: e.metadata || {},
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
          profile={profile ?? { id: '', role: 'student' } as any}
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
