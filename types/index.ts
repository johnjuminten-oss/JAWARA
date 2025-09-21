// User and Profile Types
export type UserRole = 'admin' | 'teacher' | 'student'
export type EventType = 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast'
export type VisibilityScope = 'personal' | 'class' | 'schoolwide'
export type AttendanceStatus = 'present' | 'absent' | 'late'
export type NotificationType = 'event' | 'broadcast' | 'assignment' | 'grade' | 'system'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Profile {
  id: string
  full_name?: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  class_id?: string
  avatar_url?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string | null
  event_type: EventType
  visibility_scope: VisibilityScope
  start_at: string
  end_at?: string
  location?: string | null
  created_by: string
  created_by_role: 'admin' | 'teacher' | 'student'
  target_class?: string | null
  target_user?: string | null
  teacher_id?: string | null
  subject?: string
  metadata?: Record<string, unknown> | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  description?: string
  credits: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  event_id: string
  title: string
  description?: string
  due_date: string
  total_points: number
  submission_type?: string
  created_by: string
  class_id: string
  subject_id: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submitted_at: string
  content?: string
  file_urls?: string[]
  points_earned?: number
  feedback?: string
  graded_by?: string
  graded_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message?: string
  notification_type: NotificationType
  status: NotificationStatus
  related_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  activeSchedules: number
  todayDate: string
  hasClass: boolean
  totalAssignments?: number
  pendingSubmissions?: number
  upcomingEvents?: number
  unreadNotifications?: number
}
