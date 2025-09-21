import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Helper functions for batch operations
export async function fetchBatches(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('batches')
    .select('*')
    .order('year', { ascending: false })
}

// Helper functions for class operations
export async function fetchClasses(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('classes')
    .select(`
      *,
      batch:batches(name)
    `)
    .order('name')
}

// Helper functions for teacher assignments
export async function fetchTeacherAssignments(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('teacher_assignments')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name, email),
      class:classes(name, batch_id),
      batch:classes(batch:batches(name))
    `)
    .order('subject')
}

// Helper functions for student operations
export async function fetchStudents(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('profiles')
    .select(`
      *,
      class:classes(name),
      batch:batches(name)
    `)
    .eq('role', 'student')
    .order('full_name')
}

// Helper functions for teacher operations
export async function fetchTeachers(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .order('full_name')
}

// Helper functions for events
export async function fetchEvents(supabase: ReturnType<typeof createBrowserClient<Database>>) {
  return await supabase
    .from('events')
    .select(`
      *,
      creator:profiles!created_by(full_name, role),
      class:classes(name),
      batch:classes(batch:batches(name))
    `)
    .order('start_at')
}

// Function to fetch class schedule
export async function fetchClassSchedule(
  supabase: ReturnType<typeof createBrowserClient<Database>>,
  classId: string
) {
  return await supabase
    .from('events')
    .select(`
      *,
      creator:profiles!created_by(full_name, role)
    `)
    .eq('target_class', classId)
    .in('event_type', ['lesson', 'exam', 'assignment'])
    .order('start_at')
}

// Function to fetch student schedule
export async function fetchStudentSchedule(
  supabase: ReturnType<typeof createBrowserClient<Database>>,
  studentId: string
) {
  const profileRes = await supabase
    .from('profiles')
    .select('class_id')
    .eq('id', studentId)
    .single()

  const profile = profileRes.data as { class_id?: string } | null

  if (!profile?.class_id) return { data: null, error: new Error('No class assigned') }

  return await supabase
    .from('student_schedule_view')
    .select('*')
    .or(`created_by.eq.${studentId},target_class.eq.${profile.class_id}`)
    .order('start_at')
}

// Function to fetch teacher schedule
export async function fetchTeacherSchedule(
  supabase: ReturnType<typeof createBrowserClient<Database>>,
  teacherId: string
) {
  return await supabase
    .from('events')
    .select(`
      *,
      class:classes(name, batch:batches(name))
    `)
    .or(`created_by.eq.${teacherId},target_class.in.(${
      supabase
        .from('teacher_assignments')
        .select('class_id')
        .eq('teacher_id', teacherId)
        .toString()
    })`)
    .order('start_at')
}

// Helper function to check if user has specific role
export async function hasRole(
  supabase: ReturnType<typeof createBrowserClient<Database>>,
  userId: string,
  role: 'admin' | 'teacher' | 'student'
) {
  const roleRes = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const data = roleRes.data as { role?: string } | null

  return data?.role === role
}
