import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user profile to determine redirect
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`)
        } else if (profile?.role === "teacher") {
          return NextResponse.redirect(`${origin}/teacher/dashboard`)
        } else {
          return NextResponse.redirect(`${origin}/student/dashboard`)
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
