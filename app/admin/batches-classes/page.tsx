export const dynamic = 'force-dynamic'

import { requireRole } from "@/lib/auth"
import { Header } from "@/components/dashboard/header"
import { BatchClassManagement } from "@/components/admin/batch-class-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AdminBatchesClassesPage() {
  const profile = await requireRole(["admin"])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Batches & Classes</h1>
          <p className="text-gray-600">Manage school batches and class assignments</p>
        </div>

        <BatchClassManagement />
      </main>
    </div>
  )
}
