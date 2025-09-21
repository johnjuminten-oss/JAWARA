import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Session, AuthError, SupabaseClient } from '@supabase/supabase-js'

const mockSession: Session = {
  user: { 
    id: 'test-teacher-id', 
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    user_metadata: {},
    app_metadata: {},
  },
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() + 3600
}

// Simplified and well-typed mock factory for SupabaseClient used by tests.
const createMockSupabaseClient = (overrides = {}) => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: mockSession }, error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { role: 'teacher' }, error: null })
      }),
      order: () => Promise.resolve({ data: [{ id: '1', capacity: 30, current_enrollment: 15 }], error: null })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: '1', capacity: 40 }, error: null })
        })
      })
    })
  }),
  ...overrides
}) as unknown as SupabaseClient

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn()
}))

vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => []
  })
}))

import { GET, PUT } from '@/app/api/classes/capacity/route'

describe('Class Capacity API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createRouteHandlerClient).mockImplementation(() => ({
      auth: {
        getSession: () => Promise.resolve({
          data: { session: mockSession },
          error: null
        }),
        getUser: () => Promise.resolve({
          data: { user: mockSession.user },
          error: null
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => Promise.resolve({
          data: [{ id: '1', capacity: 30, current_enrollment: 15 }],
          error: null
        })),
        single: vi.fn().mockImplementation(() => Promise.resolve({
          data: { role: 'teacher' },
          error: null
        }))
      }))
    } as any))
  })

  describe('GET /api/classes/capacity', () => {
    it('returns class capacity and enrollment', async () => {
      const request = new NextRequest('http://localhost/api/classes/capacity?classId=1')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        capacity: 30,
        current_enrollment: 15
      })
    })

    it('requires classId parameter', async () => {
      const request = new NextRequest('http://localhost/api/classes/capacity')
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('handles database errors', async () => {
      vi.mocked(createRouteHandlerClient).mockImplementation(() => ({
        auth: {
          getSession: () => Promise.resolve({
            data: { session: mockSession },
            error: null
          }),
          getUser: () => Promise.resolve({
            data: { user: mockSession.user },
            error: null
          })
        },
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      } as any))

      const request = new NextRequest('http://localhost/api/classes/capacity?classId=1')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('PUT /api/classes/capacity', () => {
    beforeEach(() => {
    vi.mocked(createRouteHandlerClient).mockImplementation(() => ({
      auth: {
        getSession: () => Promise.resolve({
          data: { session: mockSession },
          error: null
        }),
        getUser: () => Promise.resolve({
          data: { user: mockSession.user },
          error: null
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            select: vi.fn().mockImplementation(() => ({
              single: vi.fn().mockImplementation(() => Promise.resolve({
                data: { id: '1', capacity: 40 },
                error: null
              }))
            }))
          }))
        }))
      }))
    } as any))
    })

    it('updates class capacity', async () => {
      const request = new NextRequest('http://localhost/api/classes/capacity', {
        method: 'PUT',
        body: JSON.stringify({
          classId: '1',
          capacity: 40
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        id: '1',
        capacity: 40
      })
    })

    it('validates request body', async () => {
      const request = new NextRequest('http://localhost/api/classes/capacity', {
        method: 'PUT',
        body: JSON.stringify({
          classId: '1',
          capacity: -1
        })
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })

    it('requires teacher role', async () => {
      vi.mocked(createRouteHandlerClient).mockImplementation(() => ({
        auth: {
          getSession: () => Promise.resolve({
            data: { 
              session: {
                ...mockSession,
                user: {
                  ...mockSession.user,
                  id: 'test-student-id'
                }
              }
            },
            error: null
          })
        },
        from: vi.fn().mockImplementation(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => Promise.resolve({
            data: { role: 'student' },
            error: null
          }))
        }))
      } as any))

      const request = new NextRequest('http://localhost/api/classes/capacity', {
        method: 'PUT',
        body: JSON.stringify({
          classId: '1',
          capacity: 40
        })
      })

      const response = await PUT(request)
      expect(response.status).toBe(403)
    })
  })
})
