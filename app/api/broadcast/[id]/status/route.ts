import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const broadcastId = params.id
    const body = await request.json()
    const { status } = body

    if (!["read", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Upsert user status for the broadcast
    const { data, error } = await supabase
      .from("broadcast_user_status")
      .upsert({
        broadcast_id: broadcastId,
        user_id: user.id,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("broadcast_id", broadcastId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating broadcast user status:", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in broadcast status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
