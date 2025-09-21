import { createClient } from '@supabase/supabase-js'
import { 
  Profile, 
  Class, 
  Event,
  ClassWithEnrollment,
  EventWithClass,
  VisibilityScope 
} from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getClassCapacity(classId: string): Promise<ClassWithEnrollment | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*, current_enrollment:class_enrollments(count)')
    .eq('id', classId)
    .single()

  if (error) throw error
  return data
}

export async function updateClassCapacity(classId: string, capacity: number): Promise<Class> {
  const { data, error } = await supabase
    .from('classes')
    .update({ capacity })
    .eq('id', classId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEventsByVisibility(
  scope: VisibilityScope,
  userId: string
): Promise<EventWithClass[]> {
  let query = supabase
    .from('events')
    .select('*, class:classes(name)')

  switch (scope) {
    case 'personal':
      query = query.eq('user_id', userId)
      break
    case 'class':
      // For students, get events from their enrolled classes
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profile?.role === 'student') {
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .eq('student_id', userId)

        const classIds = enrollments?.map(e => e.class_id) || []
        query = query
          .eq('visibility_scope', 'class')
          .in('class_id', classIds)
      }
      break
    case 'schoolwide':
      query = query.eq('visibility_scope', 'schoolwide')
      break
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function updateEventVisibility(
  eventId: string,
  visibility_scope: VisibilityScope
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update({ visibility_scope })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
