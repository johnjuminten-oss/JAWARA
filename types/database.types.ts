export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      batches: {
        Row: {
          id: string
          name: string
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          year?: number
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          batch_id: string
          name: string
          grade_level: number
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          name: string
          grade_level: number
          created_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          name?: string
          grade_level?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: 'admin' | 'teacher' | 'student'
          batch_id: string | null
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          role?: 'admin' | 'teacher' | 'student'
          batch_id?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'teacher' | 'student'
          batch_id?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teacher_assignments: {
        Row: {
          id: string
          teacher_id: string
          class_id: string
          subject: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          class_id: string
          subject: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          class_id?: string
          subject?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
          start_at: string
          end_at: string
          location: string | null
          created_by: string
          created_by_role: 'admin' | 'teacher' | 'student'
          target_class: string | null
          target_user: string | null
          teacher_id: string | null
          visibility_scope: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
          metadata: Json | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
          start_at?: string
          end_at?: string
          location?: string | null
          created_by: string
          created_by_role: 'admin' | 'teacher' | 'student'
          target_class?: string | null
          target_user?: string | null
          teacher_id?: string | null
          visibility_scope?: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
          metadata?: Json | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
          start_at?: string
          end_at?: string
          location?: string | null
          created_by?: string
          created_by_role?: 'admin' | 'teacher' | 'student'
          target_class?: string | null
          target_user?: string | null
          teacher_id?: string | null
          visibility_scope?: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
          metadata?: Json | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      student_calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
          start_at: string
          end_at: string
          location: string | null
          created_by: string
          created_by_role: 'admin' | 'teacher' | 'student'
          target_class: string | null
          target_user: string | null
          teacher_id: string | null
          visibility_scope: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
          metadata: Json | null
          student_id: string
        }
      },
      teacher_calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: 'lesson' | 'exam' | 'assignment' | 'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
          start_at: string
          end_at: string
          location: string | null
          created_by: string
          created_by_role: 'admin' | 'teacher' | 'student'
          target_class: string | null
          target_user: string | null
          teacher_id: string | null
          visibility_scope: 'all' | 'role' | 'class' | 'batch' | 'personal' | 'schoolwide'
          metadata: Json | null
          viewing_teacher_id: string
        }
      }
    }
    Functions: {
      check_missing_teachers: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      user_role: 'admin' | 'teacher' | 'student'
      event_type: 'lesson' | 'exam' | 'assignment' | 'regular_study' | 'academic_notes' | 
        'break' | 'prayer' | 'sports' | 'arts' | 'administrative' | 
        'personal' | 'broadcast' | 'urgent_broadcast' | 'class_announcement'
    }
  }
}
