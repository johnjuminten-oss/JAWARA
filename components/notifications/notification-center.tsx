"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { useAlerts } from "@/hooks/use-alerts"
import { Bell, Check, X } from "lucide-react"

interface NotificationCenterProps {
  userId: string
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const { notifications, unreadCount: notificationUnreadCount, markAsRead, markAllAsRead } = useNotifications(userId)
  const { alerts, unreadCount: alertUnreadCount, markAsRead: markAlertAsRead, dismissAlert } = useAlerts(userId)

  const totalUnreadCount = notificationUnreadCount + alertUnreadCount

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "exam_reminder":
        return "bg-red-100 text-red-800 border-red-200"
      case "overload_warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "conflict_alert":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "missing_teacher":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "announcement":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white shadow-lg border-gray-200">
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <h3 className="font-semibold">Notifications</h3>
          {totalUnreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto bg-white">
          {/* Alerts Section */}
          {alerts.length > 0 && (
            <>
              <div className="p-2 bg-gray-50 border-b">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Alerts</h4>
              </div>
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border-b hover:bg-gray-50 bg-white ${alert.status === "unread" ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`text-xs ${getAlertTypeColor(alert.alert_type)}`}>
                          {alert.alert_type.replace("_", " ")}
                        </Badge>
                        {alert.status === "unread" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-800">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(alert.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {alert.status === "unread" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAlertAsRead(alert.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <>
              <div className="p-2 bg-gray-50 border-b">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Notifications</h4>
              </div>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 bg-white ${notification.status === "unread" ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.status === "unread" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                    {notification.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0 ml-2"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {notifications.length === 0 && alerts.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-white">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
