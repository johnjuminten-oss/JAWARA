export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth"
import { SubjectManagement } from "@/components/admin/subject-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCcw, Plus } from "lucide-react"

export default async function AdminSubjectsPage() {
  const profile = await requireRole(["admin"]) 
  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen p-6">
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subjects</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              // simple client-side event to trigger a refresh via a custom event the component listens for
              if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('subjects-refresh'))
            }}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => {
              // focus the name input in the SubjectManagement form
              if (typeof window !== 'undefined') {
                const el = document.getElementById('name') as HTMLInputElement | null
                el?.focus()
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}>
              <Plus className="h-4 w-4 mr-1" />
              New Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SubjectManagement />
        </CardContent>
      </Card>
    </div>
  )
}


