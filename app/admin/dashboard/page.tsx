export const dynamic = 'force-dynamic'

import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"

import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { UpcomingSchedules } from "@/components/dashboard/upcoming-schedules"
import { AlertModal } from "@/components/alerts/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, GraduationCap, Calendar, Plus, UserCheck, Megaphone, BookOpen, Settings } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const profile = await requireRole(["admin"])
  const supabase = await createClient()

  // Fetch dashboard data
  const [{ data: notifications }, { data: events }, { data: batches }, { data: classes }, { data: profiles }] =
    await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("events").select("*").gte("start_at", new Date().toISOString()).order("start_at").limit(5),
      supabase.from("batches").select("*"),
      supabase.from("classes").select("*"),
      supabase.from("profiles").select("*"),
    ])

  const stats = {
    activeSchedules: events?.length || 0,
    todayDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hasClass: (classes && classes.length > 0) || false,
  }

  return (
    <div className="min-h-screen bg-gray-50" role="main">
      <Header user={profile} />
      <AlertModal userId={profile.id} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <WelcomeBanner
          profile={profile}
          stats={stats}
          message="Manage your school's schedules, users, and system settings."
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-gray-900">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{profiles?.length || 0}</div>
              <p className="text-xs text-gray-500">Across all roles</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-gray-900">Active Batches</CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{batches?.length || 0}</div>
              <p className="text-xs text-gray-500">School years</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-gray-900">Total Classes</CardTitle>
              <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{classes?.length || 0}</div>
              <p className="text-xs text-gray-500">Active classes</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-gray-900">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{events?.length || 0}</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/admin/batches-classes">
                    <Button className="w-full justify-start bg-white hover:bg-blue-50 border-gray-200 text-gray-700 hover:text-blue-700 transition-colors duration-200" variant="outline">
                      <Plus className="w-4 h-4 mr-3 text-blue-600" aria-hidden="true" />
                      <span className="font-medium">Manage Batches & Classes</span>
                    </Button>
                  </Link>
                  <Link href="/admin/schedules">
                    <Button className="w-full justify-start bg-white hover:bg-green-50 border-gray-200 text-gray-700 hover:text-green-700 transition-colors duration-200" variant="outline">
                      <Calendar className="w-4 h-4 mr-3 text-green-600" aria-hidden="true" />
                      <span className="font-medium">Manage Class Schedules</span>
                    </Button>
                  </Link>
                  <Link href="/admin/student-assignments">
                    <Button className="w-full justify-start bg-white hover:bg-purple-50 border-gray-200 text-gray-700 hover:text-purple-700 transition-colors duration-200" variant="outline">
                      <Users className="w-4 h-4 mr-3 text-purple-600" aria-hidden="true" />
                      <span className="font-medium">Manage Student Assignments</span>
                    </Button>
                  </Link>
                  <Link href="/admin/teacher-assignments">
                    <Button className="w-full justify-start bg-white hover:bg-orange-50 border-gray-200 text-gray-700 hover:text-orange-700 transition-colors duration-200" variant="outline">
                      <UserCheck className="w-4 h-4 mr-3 text-orange-600" aria-hidden="true" />
                      <span className="font-medium">Manage Teacher Assignments</span>
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button className="w-full justify-start bg-white hover:bg-indigo-50 border-gray-200 text-gray-700 hover:text-indigo-700 transition-colors duration-200" variant="outline">
                      <Users className="w-4 h-4 mr-3 text-indigo-600" aria-hidden="true" />
                      <span className="font-medium">Manage Users</span>
                    </Button>
                  </Link>
                  <Link href="/admin/broadcast">
                    <Button className="w-full justify-start bg-white hover:bg-red-50 border-gray-200 text-gray-700 hover:text-red-700 transition-colors duration-200" variant="outline">
                      <Megaphone className="w-4 h-4 mr-3 text-red-600" aria-hidden="true" />
                      <span className="font-medium">Broadcast Message</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-600" aria-hidden="true" />
                  Quick Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium mb-3">
                    Create a quick schedule for any class
                  </p>
                  <Link href="/admin/schedules">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors duration-200">
                      <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span className="font-semibold">Add New Schedule</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <NotificationsPanel notifications={notifications || []} userId={profile.id} />
          </div>
        </div>

        <div className="mt-6">
          <UpcomingSchedules events={events || []} />
        </div>
      </main>
    </div>
  )
}
