import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, ctx: any) {
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

    const alertId = ctx?.params?.id
    const { data: alert, error } = await supabase
      .from("alerts")
      .update({ status })
      .eq("id", alertId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ alert })
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: any) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const alertId = ctx?.params?.id
  const { error } = await supabase.from("alerts").delete().eq("id", alertId).eq("user_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
