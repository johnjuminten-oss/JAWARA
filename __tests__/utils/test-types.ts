import { Database } from '@/types/database.types'

export type InsertEvent = Database['public']['Tables']['events']['Insert']
export type UpdateEvent = Database['public']['Tables']['events']['Update']
export type EventRow = Database['public']['Tables']['events']['Row']

export type StudentCalendarEvent = Database['public']['Views']['student_calendar_events']['Row']
export type TeacherCalendarEvent = Database['public']['Views']['teacher_calendar_events']['Row']

export const EVENT_TYPES = ['lesson', 'exam', 'assignment', 'personal', 'broadcast', 'urgent_broadcast', 'class_announcement'] as const
export type EventType = typeof EVENT_TYPES[number]

export const VISIBILITY_SCOPES = ['all', 'role', 'class', 'batch', 'personal', 'schoolwide'] as const
export type VisibilityScope = typeof VISIBILITY_SCOPES[number]

export const USER_ROLES = ['admin', 'teacher', 'student'] as const
export type UserRole = typeof USER_ROLES[number]