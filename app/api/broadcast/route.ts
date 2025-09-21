import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { type BroadcastRequestBody, type BroadcastResponse, type BroadcastErrorResponse, type NotificationInsert, type AlertInsert, type BroadcastEvent, type NotificationBase } from "@/types/broadcast"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to broadcast (admin/teacher only)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "teacher"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json() as BroadcastRequestBody
    const {
      message,
      title,
      // Normalized fields (required for new code)
      target_class,
      target_user,
      visibility_scope,
      notification_type = "notification",
      isUrgent = false,
    } = body

    if (!message || !title) {
      return NextResponse.json({ error: "Missing required fields: title and message" }, { status: 400 })
    }

    const event_type = isUrgent ? "urgent_broadcast" : "broadcast"

    // Resolver (normalized-only): prefer `target_class`, `target_user`, or `visibility_scope: 'all'`.
    let targetUsers: string[] = []
    let target_class_final: string | null = null
    let target_user_final: string | null = null
    let visibility_scope_final: string = visibility_scope ?? 'all'

    try {
      if (target_class) {
        const { data: students, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student')
          .eq('class_id', target_class)
        if (error) throw error
        targetUsers = students?.map((s) => s.id) || []
        target_class_final = target_class
        visibility_scope_final = visibility_scope ?? 'class'
      } else if (target_user) {
        targetUsers = [target_user]
        target_user_final = target_user
        visibility_scope_final = visibility_scope ?? 'user'
      } else if (visibility_scope === 'all' || !visibility_scope) {
        const { data: allUsers, error } = await supabase.from('profiles').select('id')
        if (error) throw error
        targetUsers = allUsers?.map((u) => u.id) || []
        visibility_scope_final = 'all'
      } else {
        return NextResponse.json({ error: 'Invalid or missing target configuration. Use target_class, target_user, or visibility_scope: all' }, { status: 400 })
      }

      if (!targetUsers || targetUsers.length === 0) {
        return NextResponse.json({ error: 'No target users found' }, { status: 400 })
      }
    } catch (err) {
      console.error('Error resolving targets:', err)
      return NextResponse.json({ error: 'Error resolving targets', details: String(err) }, { status: 500 })
    }

    // Create notifications/alerts for all target users
    const table = notification_type === "alert" ? "alerts" : "notifications"
    const insertData = targetUsers.map((userId) => {
      const base: NotificationBase = {
        user_id: userId,
        message: `${title}\n\n${message}`,
        status: "unread",
        metadata: {
          notification_type,
          isUrgent,
          sent_to: targetUsers.length,
          sender_role: profile.role,
          title // Store title in metadata for future reference
        }
      }

      if (notification_type === "alert") {
        // alerts table expects `alert_type` and `delivery` columns
        return {
          ...base,
          alert_type: "announcement",
          delivery: "in_app"
        } as AlertInsert
      }

      // notifications table expects `type` column
      return {
        ...base,
        type: "broadcast"
      } as NotificationInsert
    })

    // Create notifications and broadcast event. Use a service client for inserts
    // that need to bypass RLS (notifications/alerts), then use the regular
    // server client for the events insert which should be allowed by RLS for creators.
    const { createServiceClient } = await import('@/lib/supabase/server')
    const service = createServiceClient()

    const [notificationResult, eventResult] = await Promise.all([
      service.from(table).insert(insertData).select(),
      supabase.from('events').insert({
        title,
        description: message,
        event_type: event_type,
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        created_by: user.id,
        target_class: target_class_final,
        target_user: target_user_final,
        visibility_scope: visibility_scope_final,
        metadata: {
          notification_type,
          isUrgent,
          sent_to: targetUsers.length,
          sender_role: profile.role,
          full_message: `${title}\n\n${message}`
        }
      } as unknown as BroadcastEvent).select()
    ])

    if (notificationResult.error) {
      console.error("Error creating notifications:", notificationResult.error)
      throw new Error(`Failed to create notifications: ${notificationResult.error.message}`)
    }

    if (eventResult.error) {
      console.error("Error creating broadcast event:", eventResult.error)
      throw new Error(`Failed to create broadcast event: ${eventResult.error.message}`)
    }

    const response: BroadcastResponse = {
      success: true,
      sent_count: targetUsers.length,
      notifications: notificationResult.data ?? [],
      broadcast: eventResult.data?.[0] ?? {
        title,
        description: message,
        event_type: event_type,
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        created_by: user.id,
        target_class: target_class_final,
        target_user: target_user_final,
        visibility_scope: visibility_scope_final,
        metadata: {
          notification_type,
          isUrgent,
          sent_to: targetUsers.length,
          sender_role: profile.role,
          full_message: `${title}\n\n${message}`
        }
      } as BroadcastEvent
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error broadcasting:", JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
