import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase client
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: (vi.fn(() => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-admin-id' } } }, error: null })
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null })
        }),
        order: () => ({ data: [{ id: '1', name: 'Test Batch' }], error: null })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: '1', is_active: false }, error: null })
          })
        })
      })
    })
  })) as any)
}))

vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => []
  })
}))

import { PATCH, GET } from '@/app/api/admin/batches/route'

describe('Batch Management API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PATCH /api/admin/batches', () => {
    it('updates batch active status', async () => {
      const request = new NextRequest('http://localhost/api/admin/batches', {
        method: 'PATCH',
        body: JSON.stringify({
          batchId: '1',
          isActive: false
        })
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        is_active: false
      })
    })

    it('requires admin role', async () => {
      vi.mocked(createRouteHandlerClient).mockImplementationOnce(() => ({
        auth: {
          getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { role: 'student' }, error: null })
            })
          })
        })
      }) as any)

      const request = new NextRequest('http://localhost/api/admin/batches', {
        method: 'PATCH',
        body: JSON.stringify({
          batchId: '1',
          isActive: false
        })
      })

      const response = await PATCH(request)
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/admin/batches', () => {
    it('lists all batches', async () => {
      const request = new NextRequest('http://localhost/api/admin/batches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([
        { id: '1', name: 'Test Batch' }
      ])
    })

    it('filters by active status', async () => {
      const request = new NextRequest('http://localhost/api/admin/batches?active=true')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([
        { id: '1', name: 'Test Batch' }
      ])
    })
  })
})
