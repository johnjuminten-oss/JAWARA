import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message, target_user_id } = body

    // Check if user has permission to send notifications (admin/teacher only)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "teacher"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: target_user_id,
        message,
        status: "unread",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
