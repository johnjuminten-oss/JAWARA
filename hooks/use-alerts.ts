"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Alert {
  id: string
  user_id: string
  alert_type: "exam_reminder" | "overload_warning" | "conflict_alert" | "announcement" | "missing_teacher"
  message: string
  delivery: "in_app" | "email" | "both"
  status: "read" | "unread"
  created_at: string
}

export function useAlerts(userId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Initial fetch
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from("alerts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setAlerts(data || [])
        setUnreadCount(data?.filter((a) => a.status === "unread").length || 0)
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()

    // Set up real-time subscription
    const channel = supabase
      .channel("alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newAlert = payload.new as Alert
          setAlerts((prev) => [newAlert, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedAlert = payload.new as Alert
          setAlerts((prev) => prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a)))

          if (updatedAlert.status === "read") {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (alertId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("alerts").update({ status: "read" }).eq("id", alertId).eq("user_id", userId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("alerts")
        .update({ status: "dismissed" })
        .eq("id", alertId)
        .eq("user_id", userId)

      if (error) throw error

      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error dismissing alert:", error)
    }
  }

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead,
    dismissAlert,
  }
}
