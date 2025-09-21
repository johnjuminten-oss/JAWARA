export const dynamic = 'force-dynamic'

import { requireRole } from "@/lib/auth"
import { SystemSettings } from "@/components/admin/system-settings"

export default async function SystemSettingsPage() {
  const profile = await requireRole(["admin"])

  return (
    <div className="container mx-auto py-6">
      <SystemSettings />
    </div>
  )
}
