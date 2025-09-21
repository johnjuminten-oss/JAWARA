"use client"

import { Header } from "@/components/dashboard/header"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { UpcomingSchedules } from "@/components/dashboard/upcoming-schedules"
import { TeacherCalendarView } from "@/components/teacher/teacher-calendar-view"
import { BroadcastForm } from "@/components/teacher/broadcast-form"
import { AlertModal } from "@/components/alerts/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BellRing, Calendar, UserCircle, Clock, Megaphone } from "lucide-react"
import { PersonalEventsView } from "@/components/teacher/personal-events-view"
import { useState } from "react"
import type { DashboardStats, NotificationType, Profile, Notification, Event } from "@/types"

interface Class {
  id: string
  name: string
  description?: string
  batch_id?: string
  teacher_id?: string
  subject_id?: string
  schedule?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface DashboardContentProps {
  profile: Profile
  notifications: Notification[]
  events: Event[]
  classes: Class[]
  stats: DashboardStats
}

export function TeacherDashboardContent({ profile, notifications, events, classes, stats }: DashboardContentProps) {
  const [calendarViewMode, setCalendarViewMode] = useState<'my_lessons' | 'full_class' | 'personal_schedule' | 'all_schedule'>('my_lessons')

  // Client-side fallback: compute weekly events from the `events` prop and assigned `classes`
  const localWeekCount = (() => {
    try {
      const startOfWeek = new Date()
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date()
      endOfWeek.setDate(startOfWeek.getDate() + (6 - startOfWeek.getDay()))

      const classIds = (classes || []).map((c: any) => c.id).filter(Boolean)

      return (events || []).filter((e: any) => {
        if (!e || e.is_deleted) return false
        const s = new Date(e.start_at)
        if (isNaN(s.getTime())) return false
        if (s < startOfWeek || s > endOfWeek) return false
        if (e.target_user === profile.id) return true
        if (e.target_class && classIds.includes(e.target_class)) return true
        return false
      }).length
    } catch (err) {
      return 0
    }
  })()

  const displayActiveSchedules = (typeof stats?.activeSchedules === 'number' && stats.activeSchedules > 0) ? stats.activeSchedules : localWeekCount
  return (
    <div className="min-h-screen bg-gray-50" role="main">
      <Header user={profile} />
      <AlertModal userId={profile.id} />
      <main className="max-w-7xl mx-auto px-4 py-2 sm:py-4">
        <div className="space-y-2 sm:space-y-4">
          {/* Welcome Banner */}
          <WelcomeBanner
            profile={profile}
            stats={stats}
            message={`You have ${displayActiveSchedules} active schedules this week`}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-2 sm:gap-4">
            {/* Full Width Calendar */}
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 h-4 text-blue-600" />
                  Class Calendar
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={calendarViewMode} onValueChange={(value: string) => setCalendarViewMode(value as 'my_lessons' | 'full_class' | 'personal_schedule' | 'all_schedule')}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select view mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my_lessons">My Lessons</SelectItem>
                      <SelectItem value="full_class">Full Class</SelectItem>
                      <SelectItem value="personal_schedule">Personal Schedule</SelectItem>
                      <SelectItem value="all_schedule">All Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TeacherCalendarView
                  userId={profile.id}
                  userRole={profile.role}
                  classId={profile.class_id}
                  viewMode={calendarViewMode}
                  classes={classes}
                />
              </CardContent>
            </Card>

            {/* Personal Events View - Moved below calendar */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCircle className="h-4 h-4 text-green-600" />
                  Personal Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PersonalEventsView
                  events={events.filter(e => e.event_type === 'personal') as any}
                  onAddEvent={() => {
                    // The event form modal is handled by TeacherCalendarView
                    // This will use the same form with event_type set to 'personal'
                  }}
                />
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BellRing className="h-4 h-4 text-orange-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <NotificationsPanel
                  userId={profile.id}
                  notifications={notifications.filter(n =>
                    n.notification_type === 'event' || n.notification_type === 'system' || n.notification_type === 'broadcast'
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Broadcast Form */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="h-4 h-4 text-red-600" />
                Create Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BroadcastForm userId={profile.id} userRole={profile.role} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
