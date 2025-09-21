"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface Notification {
  id: string
  user_id: string
  message: string
  status: "read" | "unread"
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setNotifications(data || [])
        setUnreadCount(data?.filter((n) => n.status === "unread").length || 0)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))

          // Update unread count
          if (updatedNotification.status === "read") {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) throw error
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("user_id", userId)
        .eq("status", "unread")

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" as const })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  }
}
