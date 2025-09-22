export type VisibilityScope = 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'

export interface Profile {
  id: string
  created_at: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  first_name: string
  last_name: string
  phone_number?: string
  avatar_url?: string
  last_login_at?: string
  metadata?: Record<string, any>
}

export interface Class {
  id: string
  name: string
  description?: string
  batch_id: string
  teacher_id: string
  capacity?: number
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Batch {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
  created_by: string
  created_by_role: 'student' | 'teacher' | 'admin'
  target_class?: string
  target_user?: string
  teacher_id?: string
  visibility_scope: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
  metadata?: Record<string, any>
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ClassEnrollment {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
}

// Database response types
export type ClassWithEnrollment = Class & {
  current_enrollment: { count: number }[]
}

export type EventWithClass = Event & {
  class: Pick<Class, 'name'>
}
