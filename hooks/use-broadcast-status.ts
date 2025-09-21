"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface BroadcastStatus {
  broadcast_id: string
  status: "unread" | "read" | "dismissed"
  updated_at: string
}

export function useBroadcastStatus(userId: string, broadcastIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, BroadcastStatus>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId || broadcastIds.length === 0) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    // Initial fetch
    const fetchStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from("broadcast_user_status")
          .select("*")
          .eq("user_id", userId)
          .in("broadcast_id", broadcastIds)

        if (error) throw error

        const statusMap: Record<string, BroadcastStatus> = {}
        data?.forEach((status) => {
          statusMap[status.broadcast_id] = status
        })

        setStatuses(statusMap)
      } catch (error) {
        console.error("Error fetching broadcast statuses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatuses()

    // Set up real-time subscription
    const channel = supabase
      .channel("broadcast_user_status")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "broadcast_user_status",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new as BroadcastStatus
          if (broadcastIds.includes(newStatus.broadcast_id)) {
            setStatuses((prev) => ({
              ...prev,
              [newStatus.broadcast_id]: newStatus,
            }))
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "broadcast_user_status",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedStatus = payload.new as BroadcastStatus
          if (broadcastIds.includes(updatedStatus.broadcast_id)) {
            setStatuses((prev) => ({
              ...prev,
              [updatedStatus.broadcast_id]: updatedStatus,
            }))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, broadcastIds])

  const markAsRead = async (broadcastId: string) => {
    try {
      const response = await fetch(`/api/broadcast/${broadcastId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "read" }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark as read")
      }
    } catch (error) {
      console.error("Error marking broadcast as read:", error)
    }
  }

  const dismissBroadcast = async (broadcastId: string) => {
    try {
      const response = await fetch(`/api/broadcast/${broadcastId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "dismissed" }),
      })

      if (!response.ok) {
        throw new Error("Failed to dismiss broadcast")
      }
    } catch (error) {
      console.error("Error dismissing broadcast:", error)
    }
  }

  const getStatus = (broadcastId: string): "unread" | "read" | "dismissed" => {
    return statuses[broadcastId]?.status || "unread"
  }

  return {
    statuses,
    isLoading,
    markAsRead,
    dismissBroadcast,
    getStatus,
  }
}
