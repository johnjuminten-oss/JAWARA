import { createServerClient } from "@supabase/ssr"
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

interface Cookie {
  name: string
  value: string
  options?: CookieOptions
}

export async function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }
    
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, ({
      cookies: {
        get(name: any) {
          return cookieStore.get(name)?.value
        },
        getAll(): any {
          try {
            return cookieStore.getAll()
          } catch (error) {
            console.error('Error getting cookies:', error)
            return []
          }
        },
        set(name: any, value: any, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: any, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
            // Continue even if we can't set cookies in server component
          }
        },
      },
    }) as any)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

export { createClient as createServerClient }

// Server-only: create a Supabase client using the service role key.
// Use this only in server-route code where you need to bypass RLS safely.
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in environment')
  }

  return createAnonClient(supabaseUrl, serviceRoleKey)
}
