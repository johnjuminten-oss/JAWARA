export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { BroadcastForm } from "@/components/teacher/broadcast-form"

export default async function BroadcastPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || !["teacher", "admin"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 flex justify-center">
      <BroadcastForm userRole={profile.role} userId={user.id} />
    </div>
  )
}
