export const dynamic = 'force-dynamic'

import { requireRole, getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SecurityCard } from "@/components/profile/security-card"

export default async function SettingsPage() {
  const profile = await requireRole(["admin", "teacher", "student"])
  
  if (!profile) {
    return <div>Profile not found</div>
  }

  const supabase = await createClient()
  const [{ data: batches }, { data: classes }] = await Promise.all([
    supabase.from("batches").select("*").order("name"),
    supabase.from("classes").select("*").order("name"),
  ])

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard"
      case "teacher":
        return "/teacher/dashboard"
      case "student":
        return "/student/dashboard"
      default:
        return "/"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <Link href={getDashboardPath(profile.role)}>
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileForm profile={profile} batches={batches || []} classes={classes || []} canEditRole={false} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Account Type</h4>
                  <p className="text-sm text-gray-600 capitalize">{profile.role}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Member Since</h4>
                  <p className="text-sm text-gray-600">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">User ID</h4>
                  <p className="text-xs text-gray-500 font-mono">{profile.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecurityCard />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
