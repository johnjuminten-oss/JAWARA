"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

import { Notification } from "@/types"

interface NotificationsPanelProps {
  notifications: Notification[]
  userId: string  // Add userId for marking notifications as read
}

export function NotificationsPanel({ notifications, userId }: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => n.status === "unread").length
  const { markAsRead } = useNotifications(userId)

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold flex items-center text-gray-900">
          <Bell className="w-4 h-4 mr-2 text-blue-600" aria-hidden="true" />
          Notifications
        </CardTitle>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="bg-red-500 text-white px-1.5 py-0.5">
            {unreadCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-500 font-medium">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">              You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Notifications list">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded border-l-4 ${
                  notification.status === "unread"
                    ? "bg-blue-50 border-l-blue-500"
                    : "bg-gray-50 border-l-gray-300"
                }`}
                role="listitem"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(notification.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  {notification.status === "unread" && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="flex-shrink-0 h-7 w-7 rounded bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 flex items-center justify-center focus:ring-2 focus:ring-green-500 focus:outline-none"
                      aria-label="Mark as read"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length > 5 && (
              <div className="text-center pt-1">
                <p className="text-xs text-gray-500">
                  Showing 5 of {notifications.length} notifications
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
