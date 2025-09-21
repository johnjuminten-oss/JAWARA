"use client"

import { Header } from "@/components/dashboard/header"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { AlertModal } from "@/components/alerts/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users, Settings, BookOpen, Bell, BarChart2,
  UserPlus, FileSpreadsheet, School
} from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogFooter, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface DashboardContentProps {
  profile: any
  notifications: any[]
  stats: {
    totalBatches: number
    totalClasses: number
    totalUsers: number
    totalActiveUsers: number
    systemHealth: 'good' | 'warning' | 'error'
  }
  events: any[]
}

export function AdminDashboardContent({ profile, notifications, stats, events }: DashboardContentProps) {
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [subjForm, setSubjForm] = useState({ name: "", code: "", description: "" })
  const [savingSubject, setSavingSubject] = useState(false)
  const supabase = createClient()

  const handleQuickAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjForm.name.trim()) return
    setSavingSubject(true)
    try {
      const { error } = await supabase.from("subjects").insert({
        name: subjForm.name.trim(),
        code: subjForm.code.trim() || null,
        description: subjForm.description.trim() || null,
        is_deleted: false,
      })
      if (error) throw error
      setSubjForm({ name: "", code: "", description: "" })
      setSubjectOpen(false)
    } catch (err) {
      console.error("Quick add subject failed", err)
      // keep dialog open for correction
    } finally {
      setSavingSubject(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" role="main">
      <Header user={profile} />
      <AlertModal userId={profile.id} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* System Overview Header */}
          <Card className="border-gray-200">
            <CardContent className="pt-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">System Overview</h2>
                  <p className="text-gray-700 text-sm">
                    System Status:
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                      stats.systemHealth === 'good'
                        ? 'bg-green-100 text-green-800'
                        : stats.systemHealth === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stats.systemHealth === 'good' ? 'Healthy' : stats.systemHealth === 'warning' ? 'Warning' : 'Error'}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-white border-gray-200 text-gray-700">
                    <Users className="h-3 w-3 mr-1 text-blue-600" />
                    {stats.totalActiveUsers} Active
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-white border-gray-200 text-gray-700">
                    <School className="h-3 w-3 mr-1 text-green-600" />
                    {stats.totalBatches} Batches
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-auto py-6 flex-col gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
              <UserPlus className="h-6 w-6" aria-hidden="true" />
              <span className="font-semibold">Import Students</span>
            </Button>
            <Button className="h-auto py-6 flex-col gap-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm transition-colors">
              <School className="h-6 w-6 text-green-600" aria-hidden="true" />
              <span className="font-semibold">Add Batch</span>
            </Button>
            <Button className="h-auto py-6 flex-col gap-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm transition-colors">
              <BookOpen className="h-6 w-6 text-purple-600" aria-hidden="true" />
              <span className="font-semibold">Add Class</span>
            </Button>
            <Link href="/admin/subjects" className="block">
              <Button className="h-auto w-full py-6 flex-col gap-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm transition-colors">
                <BookOpen className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                <span className="font-semibold">Manage Subjects</span>
              </Button>
            </Link>
            <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
              <DialogTrigger asChild>
                <Button className="h-auto py-6 flex-col gap-3 bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm transition-colors">
                  <BookOpen className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  <span className="font-semibold">Quick Add Subject</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <UIDialogHeader>
                  <UIDialogTitle>Quick Add Subject</UIDialogTitle>
                </UIDialogHeader>
                <form onSubmit={handleQuickAddSubject} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="qa-subject-name">Name *</Label>
                    <Input id="qa-subject-name" value={subjForm.name} onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })} placeholder="e.g., Matematika" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qa-subject-code">Code</Label>
                    <Input id="qa-subject-code" value={subjForm.code} onChange={(e) => setSubjForm({ ...subjForm, code: e.target.value })} placeholder="e.g., MATH" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="qa-subject-desc">Description</Label>
                    <Input id="qa-subject-desc" value={subjForm.description} onChange={(e) => setSubjForm({ ...subjForm, description: e.target.value })} placeholder="Optional description" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={savingSubject}>{savingSubject ? "Saving..." : "Save"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Management Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Batch Management */}
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                    <School className="h-5 w-5 text-green-600" aria-hidden="true" />
                    Batch Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-medium">Total Batches</p>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalBatches}</span>
                    </div>
                    <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium">
                      Manage Batches
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Class Management */}
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                    <BookOpen className="h-5 w-5 text-purple-600" aria-hidden="true" />
                    Class Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-medium">Total Classes</p>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalClasses}</span>
                    </div>
                    <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium">
                      Manage Classes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Management */}
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                    <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-medium">Total Users</p>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
                    </div>
                    <Button variant="outline" className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium">
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Analytics Dashboard */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                  <BarChart2 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  System Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalActiveUsers}</p>
                    <p className="text-xs text-blue-600 mt-1">Last 24 hours</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-1">Events Created</p>
                    <p className="text-3xl font-bold text-green-900">{events.length}</p>
                    <p className="text-xs text-green-600 mt-1">This week</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-purple-800 mb-1">Email Delivery</p>
                    <p className="text-3xl font-bold text-purple-900">98%</p>
                    <p className="text-xs text-purple-600 mt-1">Success rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Notifications */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                <Bell className="h-5 w-5 text-orange-600" aria-hidden="true" />
                System Notifications
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                {notifications.filter(n => n.status === 'unread').length} new
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <NotificationsPanel
                notifications={notifications.filter(n =>
                  n.type === 'system_health' || n.type === 'new_user' || n.type === 'error'
                )}
                userId={profile.id}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
