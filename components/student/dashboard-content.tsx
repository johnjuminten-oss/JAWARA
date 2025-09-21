"use client"

import { useState, useEffect } from "react"
import { useEventsContext } from "@/hooks/use-events"
import { Header } from "@/components/dashboard/header"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { UpcomingSchedules } from "@/components/dashboard/upcoming-schedules"
import { StudentCalendarView } from "@/components/student/student-calendar-view"
import { AlertModal } from "@/components/alerts/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, UserCircle } from "lucide-react"
import { EventForm } from "@/components/schedule/event-form"
import { PersonalEventsView } from "@/components/student/personal-events-view"
import { Profile, Assignment, Subject, DashboardStats, Notification } from "@/types"
import type { Event } from "@/types/events"

interface EventWithDefaults extends Event {
  created_by_role: 'admin' | 'teacher' | 'student'
  target_user: string | null
  teacher_id: string | null
  is_deleted: boolean
}

interface DashboardContentProps {
  profile: Profile
  notifications: Notification[]
  events: EventWithDefaults[]
  assignments: Assignment[]
  subjects: Subject[]
  stats: DashboardStats
}

export function StudentDashboardContent({ profile, notifications, events, stats }: DashboardContentProps) {
  const [showEventForm, setShowEventForm] = useState(false)

  const handleEventFormClose = () => {
    setShowEventForm(false)
  }

  const { refresh } = useEventsContext()

  // Use shared events so the Personal Schedule card reflects in-memory updates
  const { events: sharedEvents } = useEventsContext()
  
  const mappedEvents: Event[] = (events || []).map(e => ({
    ...e,
    description: e.description ?? '',
    end_at: e.end_at ?? e.start_at,
    location: e.location ?? null,
    target_class: e.target_class ?? null,
    metadata: e.metadata ?? null,
    created_by_role: (e as EventWithDefaults).created_by_role || 'student',
    target_user: (e as EventWithDefaults).target_user || null,
    teacher_id: (e as EventWithDefaults).teacher_id || null,
    is_deleted: (e as EventWithDefaults).is_deleted || false,
  }))

  const mappedSharedEvents: Event[] = (sharedEvents || []).map(e => ({
    ...e,
    description: e.description ?? '',
    end_at: e.end_at ?? e.start_at,
    location: e.location ?? null,
    target_class: e.target_class ?? null,
    metadata: e.metadata ?? null,
    created_by_role: (e as EventWithDefaults).created_by_role || 'student',
    target_user: (e as EventWithDefaults).target_user || null,
    teacher_id: (e as EventWithDefaults).teacher_id || null,
    is_deleted: (e as EventWithDefaults).is_deleted || false,
  }))

  const personalEvents = mappedSharedEvents.filter(e => e.created_by === profile.id && e.event_type === 'personal')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug('Dashboard Personal Schedule debug', {
        sharedCount: (sharedEvents || []).length,
        personalCount: personalEvents.length,
        profileId: profile.id,
      })
    }
  }, [sharedEvents, personalEvents, profile.id])

  const handleEventFormSuccess = async () => {
    setShowEventForm(false)
    await refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />
      <AlertModal userId={profile.id} />
      <main className="w-full sm:max-w-[95%] lg:max-w-[98%] mx-auto px-0 sm:px-3 lg:px-4 py-0 sm:py-3">
        <div className="space-y-0 sm:space-y-3">
          {/* Welcome Banner */}
          <div className="px-3 sm:px-0">
            <WelcomeBanner 
              profile={profile}
              stats={stats}
              message={`You have ${stats.activeSchedules} scheduled events this week`}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-0 sm:gap-3 lg:gap-4">
            {/* Full Width Calendar */}
            <div className="px-2 sm:px-0">
              <Card className="border-gray-200 max-w-[100vw] sm:max-w-none mx-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-3 px-2 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-semibold">Class Schedule</CardTitle>
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="sm" className="h-8 sm:h-9">
                      <BookOpen className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">View All Events</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px] sm:min-w-full">
                      {stats.hasClass ? (
                        <StudentCalendarView
                          userId={profile.id}
                          userRole={profile.role}
                          classId={profile.class_id}
                        />
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm text-gray-600">
                            You haven&apos;t been assigned to a class yet. Please contact your administrator.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <div className="px-2 sm:px-0">
              <Card className="border-gray-200">
                <CardContent className="p-2 sm:p-4">
                  <div className="space-y-3">
                    <UpcomingSchedules
                      events={mappedEvents.filter(e =>
                        e.target_class === profile.class_id &&
                        e.created_by !== profile.id &&
                        e.event_type !== 'personal'
                      )}
                      showSubject={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and Personal Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-3 lg:gap-4">
              {/* Notifications Panel */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-medium flex items-center">
                    Notifications
                    <Badge className="ml-2 sm:ml-3 text-xs sm:text-sm">
                      {notifications.filter(n => n.status === 'unread').length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <NotificationsPanel
                    notifications={notifications}
                    userId={profile.id}
                  />
                </CardContent>
              </Card>

              {/* Personal Schedule */}
              <Card className="border-gray-200">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-medium">Personal Schedule</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-5">
                  <PersonalEventsView
                    events={personalEvents}
                    onAddEvent={() => setShowEventForm(true)}
                  />
                  {showEventForm && (
                    <EventForm
                      onClose={handleEventFormClose}
                      onSuccess={handleEventFormSuccess}
                      initialDate={undefined}
                      userRole={profile.role}
                      userId={profile.id}
                      classId={profile.class_id}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}