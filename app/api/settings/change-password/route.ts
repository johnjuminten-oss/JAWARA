import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Get password from request
    const { newPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Initialize Supabase client with SSR support
    const cookieStore = await cookies()
    const cookieValues = cookieStore.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value
      return acc
    }, {} as Record<string, string>)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        cookies: {
          get: (name: string) => cookieValues[name],
          set: (name: string, value: string, options: CookieOptions) => {
            cookieStore.set(name, value, options)
          },
          remove: (name: string, options: CookieOptions) => {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          }
        }
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('Authentication error:', userError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
