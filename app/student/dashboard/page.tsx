export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { fetchDashboardData } from "@/lib/dashboard"
import { StudentDashboardContent } from "@/components/student/dashboard-content"
import type { Profile, Event, Assignment, DashboardStats } from "@/types"

export default async function StudentDashboard() {
  try {
    const profile = await requireRole(["student"])
    if (!profile) {
      redirect('/auth/login')
    }

  const { notifications, events, assignments, subjects, weekEvents, error } = await fetchDashboardData(profile)

    if (error) {
      console.error("Dashboard data fetch error:", error)
    }

    // Calculate dashboard statistics
    const stats: DashboardStats = {
      // activeSchedules represents events for the current week
      activeSchedules: (weekEvents || []).length,
      todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hasClass: Boolean(profile.class_id),
      totalAssignments: assignments.length,
      pendingSubmissions: assignments.filter(a => !a.submissions?.[0]).length,
      upcomingEvents: events.filter(e => new Date(e.start_at) > new Date()).length,
      unreadNotifications: notifications.length
    }

    return (
      <StudentDashboardContent
        profile={profile}
        notifications={notifications}
        events={events}
        assignments={assignments}
        subjects={subjects}
        stats={stats}
      />
    )
  } catch (error) {
    console.error("StudentDashboard Error:", error)
    if (error instanceof Error && error.message !== 'redirect') {
      return (
        <StudentDashboardContent
          profile={{ 
            id: '', 
            first_name: '',
            last_name: '',
            email: '',
            role: 'student',
            created_at: '',
            updated_at: ''
          }}
          notifications={[]}
          events={[]}
          assignments={[]}
          subjects={[]}
          stats={{
            activeSchedules: 0,
            todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            hasClass: false,
            totalAssignments: 0,
            pendingSubmissions: 0,
            upcomingEvents: 0,
            unreadNotifications: 0
          }}
        />
      )
    }
    redirect('/auth/login')
  }
}
