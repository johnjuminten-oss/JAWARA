"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X, Megaphone, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBroadcastStatus } from "@/hooks/use-broadcast-status"

interface BroadcastBannerProps {
  userId: string
}

interface Broadcast {
  id: string
  title?: string
  message?: string
  created_at: string
  event_type: 'broadcast' | 'urgent_broadcast'
  created_by: string
  target_class?: string | null
  target_user?: string | null
  visibility_scope?: 'all' | 'class' | 'user'
  // legacy optional fields kept in metadata
  metadata: {
    notification_type: string
    isUrgent: boolean
    sent_to: number
  sender_role?: string
  // optional fields used for role/batch targeting stored in metadata
  target_role?: string | null
  target_batch?: string | null
  }
  sender?: {
    full_name: string
    role: string
  }
}

export function BroadcastBanner({ userId }: BroadcastBannerProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [userProfile, setUserProfile] = useState<any>(null)
  
  useEffect(() => {
    const supabase = createClient()

    // Fetch recent broadcasts
    const fetchBroadcasts = async () => {
      // First get the user's profile to check role and class
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, class_id, batch_id')
        .eq('id', userId)
        .single()

      if (!profile) return
      setUserProfile(profile)

      // Fetch recent broadcast events (filtering client-side for visibility). Keep query simple and robust.
      const { data: broadcasts } = await supabase
        .from('events')
        .select(`*, sender:created_by ( full_name, role )`)
        .in('event_type', ['broadcast', 'urgent_broadcast'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (!broadcasts) return

      // Client-side filter for visibility
      const visible = (broadcasts as Broadcast[]).filter((b) => {
        if (profile.role !== 'student') return true
  if (b.visibility_scope === 'all') return true
  if (b.visibility_scope === 'class' && b.target_class === profile?.class_id) return true
  if (b.visibility_scope === 'user' && b.target_user === userId) return true
  if (b.metadata?.target_batch && profile?.batch_id && String(b.metadata.target_batch) === String(profile.batch_id)) return true
  if (b.metadata?.target_role && b.metadata.target_role === 'student') return true
        return false
      })

      setBroadcasts(visible as Broadcast[])
    }

    fetchBroadcasts()

    // Subscribe to new broadcasts
    const channel = supabase
      .channel("broadcasts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          // Subscribe to all broadcast inserts; we do runtime filtering by payload
          filter: "event_type=eq.broadcast"
        },
        async (payload) => {
          // Check if user should receive this broadcast
          const broadcast = payload.new as Broadcast
          if (userProfile && userProfile.role === 'student') {
              const shouldReceive = broadcast.visibility_scope === 'all' ||
                (broadcast.visibility_scope === 'class' && broadcast.target_class === userProfile.class_id) ||
                (broadcast.visibility_scope === 'user' && broadcast.target_user === userId) ||
                (broadcast.metadata?.target_batch && userProfile.batch_id && String(broadcast.metadata.target_batch) === String(userProfile.batch_id)) ||
                (broadcast.metadata?.target_role && broadcast.metadata.target_role === 'student')

            if (!shouldReceive) return
          }
          setBroadcasts(prev => [payload.new as Broadcast, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const currentBroadcast = broadcasts[currentIndex]

  if (!currentBroadcast || dismissed.has(currentBroadcast.id)) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(prev => new Set([...prev, currentBroadcast.id]))
    if (currentIndex < broadcasts.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < broadcasts.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const formattedTime = new Date(currentBroadcast.created_at).toLocaleTimeString()
  const senderName = currentBroadcast.sender?.full_name || "Unknown"
  const senderRole = currentBroadcast.sender?.role || "user"
