import { EventType } from './event-types';
export type { EventType };

// Define Event interface to match database types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_at: string;
  end_at: string;
  location: string | null;
  created_by: string;
  created_by_role: 'admin' | 'teacher' | 'student';
  target_class: string | null;
  target_user: string | null;
  teacher_id: string | null;
  visibility_scope: 'class' | 'schoolwide' | 'personal';  // Includes personal events
  metadata: {
    week_no?: number;        // Week number for recurring events
    day_name?: string;       // Day name (e.g., 'Senin', 'Selasa')
    teacher_name?: string;   // Display name of teacher
    color?: string;          // Custom color override
    subject_type?: 'mathematics' | 'language' | 'social_science' | 'civics' | 
                  'technology' | 'religious' | 'physical_education' | 'general';
    target_role?: string;    // For broadcasts: target role
    target_batch?: string;   // For broadcasts: target batch
  } | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

// Color mapping for event types based on Supabase seed data
export const eventColors = {
  lesson: '#28A745',           // Green - Growth, stability
  exam: '#DC3545',             // Red - Urgency, importance
  assignment: '#007BFF',       // Blue - Focus, clarity
  break: '#F8F9FA',            // Light gray - Calm, neutral
  prayer: '#6F42C1',           // Purple - Spiritual
  sports: '#FD7E14',           // Orange - Energy, activity
  administrative: '#FFC107',   // Yellow - Administrative notices
  broadcast: '#17A2B8',        // Cyan - General info
  urgent_broadcast: '#C82333', // Dark red - Critical, danger
  class_announcement: '#FF6F61', // Coral - Friendly notice
  personal: '#6C757D',         // Gray - Neutral, low priority
} as const;

// Event type groupings for filtering
export const eventTypeGroups: Record<string, EventType[]> = {
  academic: ['lesson', 'exam', 'assignment'],
  activities: ['break', 'prayer', 'sports'],
  administrative: ['administrative'],
  announcements: ['broadcast', 'urgent_broadcast', 'class_announcement'],
  personal: ['personal']
};
