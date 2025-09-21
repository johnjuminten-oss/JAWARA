"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "@/hooks/use-alerts"
import { AlertTriangle, Clock, Users, X, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

interface AlertModalProps {
  userId: string
}

export function AlertModal({ userId }: AlertModalProps) {
  const { alerts, markAsRead, dismissAlert } = useAlerts(userId)
  const [currentAlert, setCurrentAlert] = useState<any>(null)

  // Show modal for high-priority unread alerts
  useEffect(() => {
    const highPriorityAlert = alerts.find(
      (alert) => alert.status === "unread" && ["exam_reminder", "conflict_alert"].includes(alert.alert_type),
    )

    if (highPriorityAlert && !currentAlert) {
      setCurrentAlert(highPriorityAlert)
    }
  }, [alerts, currentAlert])

  const handleClose = () => {
    if (currentAlert) {
      markAsRead(currentAlert.id)
      setCurrentAlert(null)
    }
  }

  const handleDismiss = () => {
    if (currentAlert) {
      dismissAlert(currentAlert.id)
      setCurrentAlert(null)
    }
  }

  if (!currentAlert) return null

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "exam_reminder":
        return <Clock className="w-6 h-6 text-red-500" />
      case "conflict_alert":
        return <AlertTriangle className="w-6 h-6 text-orange-500" />
      case "overload_warning":
        return <Users className="w-6 h-6 text-yellow-500" />
      case "missing_teacher":
        return <UserCheck className="w-6 h-6 text-purple-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-blue-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "exam_reminder":
        return "border-red-200 bg-red-50"
      case "conflict_alert":
        return "border-orange-200 bg-orange-50"
      case "overload_warning":
        return "border-yellow-200 bg-yellow-50"
      case "missing_teacher":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-md border-2 ${getAlertColor(currentAlert.alert_type)}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            {getAlertIcon(currentAlert.alert_type)}
            <div>
              <CardTitle className="text-lg">Alert</CardTitle>
              <Badge className="mt-1 text-xs">{currentAlert.alert_type.replace("_", " ")}</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-800">{currentAlert.message}</p>
          <div className="flex space-x-2">
            <Button onClick={handleClose} className="flex-1">
              Got it
            </Button>
            <Button variant="outline" onClick={handleDismiss} className="flex-1 bg-white hover:bg-gray-50">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
