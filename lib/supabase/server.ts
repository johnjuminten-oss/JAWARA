import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { type SupabaseClient } from "@supabase/supabase-js"
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { cookies } from "next/headers"

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs'

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
        get(name: string): string | undefined {
          return cookieStore.get(name)?.value
        }
      },
    }))
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
