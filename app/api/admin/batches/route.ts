import { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"

const batchUpdateSchema = z.object({
  batchId: z.string().uuid(),
  isActive: z.boolean(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: session } = await supabase.auth.getSession()

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.session?.user.id)
      .single()

    if (profile?.role !== "admin") {
      return new Response("Forbidden", { status: 403 })
    }

    const body = await request.json()
    const validatedData = batchUpdateSchema.parse(body)

    const updateData: Record<string, any> = {
      is_active: validatedData.isActive,
    }

    if (validatedData.startDate) {
      updateData.start_date = validatedData.startDate
    }

    if (validatedData.endDate) {
      updateData.end_date = validatedData.endDate
    }

    // Update batch
    const { data, error } = await supabase
      .from("batches")
      .update(updateData)
      .eq("id", validatedData.batchId)
      .select()
      .single()

    if (error) throw error

    // If deactivating batch, also deactivate all associated classes
    if (!validatedData.isActive) {
      await supabase
        .from("classes")
        .update({ is_active: false })
        .eq("batch_id", validatedData.batchId)
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[BATCH_UPDATE_ERROR]", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: error instanceof z.ZodError ? 400 : 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const searchParams = new URL(request.url).searchParams
    const active = searchParams.get("active")
    
    let query = supabase.from("batches").select(`
      *,
      classes:classes(
        id,
        name,
        capacity,
        is_active,
        enrollments:class_enrollments(count)
      )
    `)

    if (active !== null) {
      query = query.eq("is_active", active === "true")
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[BATCH_LIST_ERROR]", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
