import type { EventType } from "@/types/events"

export type { EventType }

// Color mapping for event types based on the new structured color scheme
export const eventColors = {
  // Academic Learning (calm, trust) - Blue / Indigo
  lesson: '#0ea5e9',           // bg-sky-500 - Core teaching, medium blue
  regular_study: '#38bdf8',    // bg-sky-400 - Study session, lighter blue
  academic_notes: '#818cf8',   // bg-indigo-400 - Notes, slightly purple/blue

  // Assessment / Urgency (alert, attention) - Red / Orange
  exam: '#ef4444',             // bg-red-500 - Strong alert
  urgent_broadcast: '#dc2626', // bg-red-600 - Even stronger urgency

  // Task / Administration (structure, neutral) - Amber / Cyan / Gray
  assignment: '#fbbf24',       // bg-amber-400 - Task-oriented
  administrative: '#6b7280',   // bg-gray-500 - Admin tasks
  class_announcement: '#06b6d4', // bg-cyan-500 - Announcement distinct from tasks

  // Wellbeing / Break (rest, refresh) - White / Yellow
  break: '#ffffff',            // White - Break/relax, clean background
  prayer: '#eab308',           // Yellow - Spiritual/peaceful

  // Creative / Extra Curricular (energy, enthusiasm) - Orange / Pink / Fuchsia
  sports: '#f97316',           // bg-orange-500 - Energetic activity
  arts: '#ec4899',             // bg-pink-500 - Creative expression
  personal: '#d946ef',         // bg-fuchsia-500 - Distinct personal events

  // Communication (inform, share) - Green
  broadcast: '#22c55e',        // bg-green-500 - Standard communication
} as const;

// Vibrant background colors for calendar cells
export const eventBackgroundColors = { ...eventColors };

// Text colors for strong contrast (white for dark backgrounds, black for light)
export const eventTextColors = Object.keys(eventColors).reduce(
  (acc, key) => ({
    ...acc,
    [key]: key === 'break' ? '#000000' : '#FFFFFF',
  }),
  {} as Record<EventType, string>
);

// Helper function to get readable event type name
export const getEventTypeName = (eventType: EventType): string => {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to get background color by event type
export const getEventBackgroundColor = (eventType: EventType): string => {
  return eventBackgroundColors[eventType] || eventBackgroundColors.personal;
};

// Helper function to get text color by event type
export const getEventTextColor = (eventType: EventType): string => {
  return eventTextColors[eventType] || eventTextColors.personal;
};

// Helper function to get border color by event type
export const getEventBorderColor = (eventType: EventType): string => {
  return eventColors[eventType] || eventColors.personal;
};