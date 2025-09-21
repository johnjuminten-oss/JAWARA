// Define the event types and their organization
export const EventTypeGroups = {
  academic: ['lesson', 'regular_study', 'academic_notes', 'exam', 'assignment'], // Academic sessions and assessments
  activities: ['break', 'prayer', 'sports', 'arts'], // Non-academic activities
  administrative: ['administrative'],                 // Administrative events
  announcements: ['broadcast', 'urgent_broadcast', 'class_announcement'], // Announcements
  personal: ['personal'],                             // Personal user events
} as const;

export type EventType =
  | 'lesson'           // Regular classes (including arts, religious studies, TKA)
  | 'regular_study'    // Study session, lighter blue
  | 'academic_notes'   // Notes, slightly purple/blue
  | 'exam'            // Try Out sessions
  | 'assignment'      // Homework and assignments
  | 'break'           // Break periods (Istirahat)
  | 'prayer'          // Only Sholat Jumat
  | 'sports'          // Physical education (Olahraga)
  | 'arts'            // Arts and creative activities
  | 'administrative'  // Pembinaan and prep sessions
  | 'broadcast'       // General announcements
  | 'urgent_broadcast' // Urgent announcements
  | 'class_announcement' // Class-specific announcements
  | 'personal';       // Personal events for students and teachers

// Role-based event type access
export const RoleEventTypes = {
  admin: [
    'lesson',
    'exam',
    'break',
    'prayer',
    'sports',
    'administrative',
    'personal'
  ],
  teacher: [
    'lesson',
    'exam',
    'sports',
    'administrative',
    'personal'
  ],
  student: [
    'personal'
  ]
} as const;