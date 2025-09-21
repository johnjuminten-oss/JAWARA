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
    const alert_type = searchParams.get("alert_type")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (alert_type) {
      query = query.eq("alert_type", alert_type)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: alerts, error } = await query

    if (error) throw error

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
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
    const { alert_type, message, target_user_id, delivery = "in_app" } = body

    // Check if user has permission to create alerts (admin/teacher only)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "teacher"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { data: alert, error } = await supabase
      .from("alerts")
      .insert({
        user_id: target_user_id,
        alert_type,
        message,
        delivery,
        status: "unread",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    console.error("Error creating alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
