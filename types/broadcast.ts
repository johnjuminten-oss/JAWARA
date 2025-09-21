export interface Broadcast {
  id: string
  description: string
  created_at: string
  event_type: 'broadcast' | 'urgent_broadcast'
  created_by: string
  // New normalized targeting fields
  target_class?: string
  target_user?: string
  visibility_scope?: 'all' | 'class' | 'user' | 'role' | 'batch'
  // Legacy fields removed: use `target_class` / `target_user` / `visibility_scope`
  metadata: {
    notification_type: 'notification' | 'alert'
    isUrgent: boolean
    sent_to: number
    sender_role?: string
  }
  sender?: {
    full_name: string
    role: string
  }
}

export interface BroadcastNotification {
  id: string
  user_id: string
  message: string
  status: 'read' | 'unread'
  type: string
  created_at: string
  updated_at?: string
  metadata: {
    notification_type: 'notification' | 'alert'
    isUrgent: boolean
    sent_to: number
    sender_role?: string
  }
}
