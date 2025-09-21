"use client"

import { Calendar, Clock, Bell, Check, X, GraduationCap, BookOpen, Users2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useNotifications } from "@/hooks/use-notifications"
import { useAlerts } from "@/hooks/use-alerts"
import { cn } from "@/lib/utils"
import { Profile, DashboardStats } from "@/types"

interface WelcomeBannerProps {
  profile: Profile
  stats: DashboardStats
  message?: string
}

export function WelcomeBanner({ profile, stats, message }: WelcomeBannerProps) {
  const { notifications, unreadCount: notificationUnreadCount, markAsRead } = useNotifications(profile.id)
  const { alerts, unreadCount: alertUnreadCount, markAsRead: markAlertAsRead, dismissAlert } = useAlerts(profile.id)

  const totalUnreadCount = notificationUnreadCount + alertUnreadCount

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const getDisplayName = () => {
    // Prefer full_name, fall back to first + last name, email, or a friendly placeholder
    if (profile?.full_name && profile.full_name.trim()) return profile.full_name
    const first = profile?.first_name ?? ''
    const last = profile?.last_name ?? ''
    const combined = `${first} ${last}`.trim()
    if (combined) return combined
    if (profile?.email) return profile.email
    return 'there'
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "exam_reminder":
        return "bg-red-100 text-red-800 border-red-200"
      case "overload_warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "conflict_alert":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "announcement":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "alert":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-orange-100 text-orange-800 border-orange-200"
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

  const getRoleIcon = () => {
    switch (profile.role) {
      case "admin":
        return <ShieldCheck className="w-8 h-8 text-primary" />
      case "teacher":
        return <GraduationCap className="w-8 h-8 text-primary" />
      case "student":
        return <Users2 className="w-8 h-8 text-primary" />
      default:
        return <BookOpen className="w-8 h-8 text-primary" />
    }
  }

  const getRoleMessage = () => {
    switch (profile.role) {
      case "admin":
        return "Manage your institution's academic resources and user access"
      case "teacher":
        return "Track your classes and student progress"
      case "student":
        return "View your schedule and stay updated with your courses"
      default:
        return message || "Welcome to your dashboard"
    }
  }

  return (
    <Card className="mb-6 overflow-hidden" role="region" aria-labelledby="welcome-heading">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Left Column - Welcome Message */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {getRoleIcon()}
              </div>
              <div>
                <h2 id="welcome-heading" className="text-xl sm:text-2xl font-bold">
                  {getGreeting()}, {getDisplayName()}!
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{getRoleMessage()}</p>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">{stats.activeSchedules}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Active Schedules</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">{stats.todayDate}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Today</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Column - Quick Stats or Additional Info */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">Quick Overview</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your current activity status</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{totalUnreadCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Unread Updates</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{stats?.activeSchedules || 0}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {/* Notification Section */}
      {totalUnreadCount > 0 && (
        <div className="border-t">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold">Recent Updates</h3>
                <Badge variant="secondary" className="bg-secondary text-primary">
                  {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                </Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4" role="list" aria-label="Recent notifications">
              {/* Left Column - Alerts */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Important Alerts</h4>
                {alerts.slice(0, 3).map((alert) => (
                  <Card key={alert.id} role="listitem">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge className={`px-1.5 py-0.5 text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                              {alert.alert_type.replace("_", " ")}
                            </Badge>
                            {alert.status === "unread" && (
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" aria-label="Unread alert"></div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {alert.status === "unread" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAlertAsRead(alert.id)}
                              className="h-7 w-7"
                              aria-label="Mark alert as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissAlert(alert.id)}
                            className="h-7 w-7"
                            aria-label="Dismiss alert"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Right Column - Notifications */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">General Updates</h4>
                {notifications.slice(0, 3).map((notification) => (
                  <Card key={notification.id} role="listitem">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {notification.status === "unread" && (
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" aria-label="Unread notification"></div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.created_at)}</p>
                        </div>
                        {notification.status === "unread" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 w-7"
                            aria-label="Mark notification as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
