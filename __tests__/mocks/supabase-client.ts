import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type MockSupabaseClient = SupabaseClient<Database>

export const createMockClient = () => {
  const defaultData = { data: null, error: null }
  
  const createQueryChain = (response = defaultData) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(response),
    }
    return chain
  }

  const mockClient = {
    from: vi.fn().mockReturnValue(createQueryChain()),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }),
    },
  } as unknown as MockSupabaseClient

  return {
    client: mockClient,
    createQueryChain,
  }
}
