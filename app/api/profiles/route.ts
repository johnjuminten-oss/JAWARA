import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await req.json()
    const user = await supabase.auth.getUser()
    if (!user || !user.data || !user.data.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const uid = user.data.user.id

    // enforce that id matches the currently authenticated user
    if (body.id && body.id !== uid) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 })
    }

    const payload = {
      id: uid,
      email: body.email || user.data.user.email,
      full_name: body.full_name || null,
      role: body.role || 'student',
    }

    // Use upsert to be idempotent and handle concurrent creation attempts
    const { data, error } = await supabase
      .from('profiles')
      .upsert([payload], { onConflict: 'id', ignoreDuplicates: true })
      .select()
      .single()

    if (error) {
      // If a duplicate key or race condition occurred, try to fetch the existing profile
      // and return it instead of failing.
      console.error('Profile upsert error, attempting fallback select:', error)
      const { data: existing, error: fetchErr } = await supabase.from('profiles').select().eq('id', uid).single()
      if (!fetchErr && existing) {
        return NextResponse.json(existing)
      }
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
