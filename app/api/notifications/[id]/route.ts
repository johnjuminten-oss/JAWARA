import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, ctx: RouteParams) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    const notificationId = ctx?.params?.id
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ status })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: RouteParams) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const notificationId = ctx?.params?.id
  const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
