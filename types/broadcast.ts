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
    notification_type: NotificationType
    isUrgent: boolean
    sent_to: number
    sender_role?: string
  }
}

export type NotificationType = 'notification' | 'alert'
export type VisibilityScope = 'all' | 'class' | 'user' | 'role' | 'batch'
export type BroadcastEventType = 'broadcast' | 'urgent_broadcast'

export interface BroadcastRequestBody {
  message: string
  title: string
  target_class?: string | null
  target_user?: string | null
  visibility_scope?: VisibilityScope
  notification_type?: NotificationType
  isUrgent?: boolean
}

export interface NotificationBase {
  user_id: string
  message: string
  status: 'read' | 'unread'
  metadata: {
    notification_type: NotificationType
    isUrgent: boolean
    sent_to: number
    sender_role: string
    title: string
  }
}

export interface NotificationInsert extends NotificationBase {
  type: 'broadcast'
}

export interface AlertInsert extends NotificationBase {
  alert_type: 'announcement'
  delivery: 'in_app'
}

export interface BroadcastEvent {
  title: string
  description: string
  event_type: BroadcastEventType
  start_at: string
  end_at: string
  created_by: string
  target_class: string | null
  target_user: string | null
  visibility_scope: VisibilityScope
  metadata: {
    notification_type: NotificationType
    isUrgent: boolean
    sent_to: number
    sender_role: string
    full_message: string
  }
}

export interface BroadcastResponse {
  success: true
  sent_count: number
  notifications: NotificationInsert[] | AlertInsert[]
  broadcast: BroadcastEvent
}

export interface BroadcastErrorResponse {
  error: string
  details?: string
}
