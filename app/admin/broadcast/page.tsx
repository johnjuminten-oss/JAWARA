export const dynamic = 'force-dynamic'

import { requireRole } from "@/lib/auth"
import { Header } from "@/components/dashboard/header"
import { AdminBroadcastForm } from "@/components/admin/admin-broadcast-form"

export default async function AdminBroadcastPage() {
  const profile = await requireRole(["admin"])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />
      <main className="max-w-4xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Broadcast</h1>
          <p className="text-gray-600 mt-1">
            Send important announcements and notifications to the entire school community
          </p>
        </div>

        <AdminBroadcastForm classes={[]} batches={[]} />
      </main>
    </div>
  )
}
