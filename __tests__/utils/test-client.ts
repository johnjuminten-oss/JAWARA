import { vi } from 'vitest'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

interface TestAuthParams {
  id: string
  role: 'admin' | 'teacher' | 'student'
}

export const setupTestAuth = async (params: TestAuthParams): Promise<SupabaseClient<Database>> => {
  // Create client with test credentials from environment
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Mock auth state
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: {
      session: {
        user: { id: params.id },
        access_token: 'test-token',
        refresh_token: 'test-refresh',
      }
    },
    error: null
  } as any)

  return supabase
}

interface MockQueryChain {
  select: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  upsert: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
}

export const createTestClient = (initialData?: any) => {
  return {
    from: vi.fn().mockReturnValue(
      createMockQueryChain(initialData || { data: null, error: null })
    ),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      }),
    },
  }
}
