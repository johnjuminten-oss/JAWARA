import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: (vi.fn(() => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { role: 'student' }, error: null })
        }),
        in: () => ({
          order: () => Promise.resolve({
            data: [
              {
                id: '1',
                title: 'Test Event',
                visibility_scope: 'class',
                class: { name: 'Test Class' }
              }
            ],
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: '1', visibility_scope: 'class' }, error: null })
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

import { GET, PUT } from '@/app/api/events/visibility/route'

describe('Event Visibility API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/events/visibility', () => {
    it('returns visible events for user', async () => {
      const request = new NextRequest('http://localhost/api/events/visibility?scope=class')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0]).toEqual(expect.objectContaining({
        id: '1',
        title: 'Test Event',
        visibility_scope: 'class'
      }))
    })

    it('filters by visibility scope', async () => {
      const request = new NextRequest('http://localhost/api/events/visibility?scope=personal')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('handles database errors', async () => {
      vi.mocked(createRouteHandlerClient).mockImplementationOnce(() => ({
        auth: {
          getSession: () => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Database error' } })
            })
          })
        })
      }) as any)

      const request = new NextRequest('http://localhost/api/events/visibility?scope=personal')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
    })
  })

  describe('PUT /api/events/visibility', () => {
    it('updates event visibility', async () => {
      const request = new NextRequest('http://localhost/api/events/visibility', {
        method: 'PUT',
        body: JSON.stringify({
          eventId: '1',
          visibility_scope: 'class'
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(expect.objectContaining({
        id: '1',
        visibility_scope: 'class'
      }))
    })

    it('validates request body', async () => {
      const request = new NextRequest('http://localhost/api/events/visibility', {
        method: 'PUT',
        body: JSON.stringify({
          eventId: '1',
          visibility_scope: 'invalid'
        })
      })

      const response = await PUT(request)
      expect(response.status).toBe(400)
    })

    it('checks event ownership', async () => {
      vi.mocked(createRouteHandlerClient).mockImplementationOnce(() => ({
        auth: {
          getSession: () => Promise.resolve({ data: { session: { user: { id: 'different-user-id' } } }, error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { user_id: 'original-user-id' }, error: null })
            })
          })
        })
      }) as any)

      const request = new NextRequest('http://localhost/api/events/visibility', {
        method: 'PUT',
        body: JSON.stringify({
          eventId: '1',
          visibility_scope: 'class'
        })
      })

      const response = await PUT(request)
      expect(response.status).toBe(403)
    })
  })
})

describe('Event Teacher Assignment Rules', () => {
  let adminClient: SupabaseClient<Database>
  let teacherClient: SupabaseClient<Database>
  let teacher2Client: SupabaseClient<Database>
  let studentClient: SupabaseClient<Database>

  type Tables = Database['public']['Tables']
  type ClassInsert = Tables['classes']['Insert']
  type ProfileUpdate = Tables['profiles']['Update']
  type ClassTeacherInsert = Tables['class_teachers']['Insert']

  const testIds = {
    admin: uuidv4(),
    teacher1: uuidv4(),
    teacher2: uuidv4(),
    student: uuidv4(),
    class: uuidv4(),
    event1: uuidv4(), // Teacher1 assigned event
    event2: uuidv4(), // Class event with no teacher assigned
    event3: uuidv4(), // Teacher2 assigned event
  }

  beforeAll(async () => {
    // Set up test users
    adminClient = await setupTestAuth({
      id: testIds.admin,
      role: 'admin',
    })

    teacherClient = await setupTestAuth({
      id: testIds.teacher1,
      role: 'teacher',
    })

    teacher2Client = await setupTestAuth({
      id: testIds.teacher2,
      role: 'teacher',
    })

    studentClient = await setupTestAuth({
      id: testIds.student,
      role: 'student',
    })

    // Create test class
    await adminClient.from('classes').insert({
      id: testIds.class,
      name: 'Test Class',
    })

    // Assign teachers to class
    await adminClient.from('class_teachers').insert([
      {
        class_id: testIds.class,
        teacher_id: testIds.teacher1,
      },
      {
        class_id: testIds.class,
        teacher_id: testIds.teacher2,
      },
    ])

    // Assign student to class
    await adminClient.from('profiles').update({
      class_id: testIds.class,
    }).eq('id', testIds.student)

    // Create test events
    await adminClient.from('events').insert([
      {
        id: testIds.event1,
        title: 'Teacher1 Event',
        event_type: 'lesson' as const,
        target_class: testIds.class,
        teacher_id: testIds.teacher1,
        created_by: testIds.admin,
        created_by_role: 'admin' as const,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class' as const,
        metadata: {}
      } satisfies Database['public']['Tables']['events']['Insert'],
      {
        id: testIds.event2,
        title: 'Class Event No Teacher',
        event_type: 'exam' as const,
        target_class: testIds.class,
        created_by: testIds.admin,
        created_by_role: 'admin' as const,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class' as const,
        metadata: {}
      } satisfies Database['public']['Tables']['events']['Insert'],
      {
        id: testIds.event3,
        title: 'Teacher2 Event',
        event_type: 'lesson' as const,
        target_class: testIds.class,
        teacher_id: testIds.teacher2,
        created_by: testIds.admin,
        created_by_role: 'admin' as const,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class' as const,
        metadata: {}
      } satisfies Database['public']['Tables']['events']['Insert']
    ])
  })

  it('Student can see all class events regardless of teacher assignment', async () => {
    const { data: events, error } = await studentClient
      .from('student_calendar_events')
      .select('*')
      .eq('target_class', testIds.class)
    
    expect(error).toBeNull()
    expect(events).toHaveLength(3)
    expect(events?.map(e => e.id)).toContain(testIds.event1)
    expect(events?.map(e => e.id)).toContain(testIds.event2)
    expect(events?.map(e => e.id)).toContain(testIds.event3)
  })

  it('Teacher1 sees their assigned events and class events with no teacher', async () => {
    const { data: events, error } = await teacherClient
      .from('teacher_calendar_events')
      .select('*')
      .eq('target_class', testIds.class)
    
    expect(error).toBeNull()
    expect(events).toHaveLength(2)
    expect(events?.map(e => e.id)).toContain(testIds.event1) // Their assigned event
    expect(events?.map(e => e.id)).toContain(testIds.event2) // No teacher assigned
    expect(events?.map(e => e.id)).not.toContain(testIds.event3) // Teacher2's event
  })

  it('Teacher2 sees their assigned events and class events with no teacher', async () => {
    const { data: events, error } = await teacher2Client
      .from('teacher_calendar_events')
      .select('*')
      .eq('target_class', testIds.class)
    
    expect(error).toBeNull()
    expect(events).toHaveLength(2)
    expect(events?.map(e => e.id)).not.toContain(testIds.event1) // Teacher1's event
    expect(events?.map(e => e.id)).toContain(testIds.event2) // No teacher assigned
    expect(events?.map(e => e.id)).toContain(testIds.event3) // Their assigned event
  })

  it('Teacher can only update their own events', async () => {
    // Try to update their own event
    const { error: updateOwnError } = await teacherClient
      .from('events')
      .update({ title: 'Updated Title' })
      .eq('id', testIds.event1)
    
    expect(updateOwnError).toBeNull()

    // Try to update another teacher's event
    const { error: updateOtherError } = await teacherClient
      .from('events')
      .update({ title: 'Should Fail' })
      .eq('id', testIds.event3)
    
    expect(updateOtherError).toBeDefined()
  })

  it('Teacher can only create events they teach or with no teacher assigned', async () => {
    // Create event with self as teacher
    const { error: createOwnError } = await teacherClient
      .from('events')
      .insert({
        title: 'New Teacher1 Event',
        event_type: 'lesson',
        target_class: testIds.class,
        teacher_id: testIds.teacher1,
        created_by: testIds.teacher1,
        created_by_role: 'teacher',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class'
      })
    
    expect(createOwnError).toBeNull()

    // Create event with no teacher assigned
    const { error: createNoTeacherError } = await teacherClient
      .from('events')
      .insert({
        title: 'New No Teacher Event',
        event_type: 'exam',
        target_class: testIds.class,
        created_by: testIds.teacher1,
        created_by_role: 'teacher',
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class'
      })
    
    expect(createNoTeacherError).toBeNull()

    // Try to create event assigned to another teacher
    const { error: createOtherTeacherError } = await teacherClient
      .from('events')
      .insert({
        title: 'Should Fail',
        event_type: 'lesson' as const,
        target_class: testIds.class,
        teacher_id: testIds.teacher2,
        created_by: testIds.teacher1,
        created_by_role: 'teacher' as const,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 3600000).toISOString(),
        visibility_scope: 'class' as const,
        metadata: {}
      } satisfies Database['public']['Tables']['events']['Insert'])
    
    expect(createOtherTeacherError).toBeDefined()
  })
})
