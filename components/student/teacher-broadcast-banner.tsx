"use client"

import { useEffect, useState } from "react"
import { AlertCircle, X, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface TeacherBroadcastBannerProps {
  userId: string
  classId: string
}

interface Broadcast {
  id: string
  message: string
  created_at: string
  created_by: string
  target_class?: string | null
  visibility_scope?: 'all' | 'class' | 'batch' | 'role'
  metadata: {
    title: string
    isUrgent: boolean
    teacher_name: string
    target_batch?: string | null
    target_role?: string | null
  }
}

export function TeacherBroadcastBanner({ userId, classId }: TeacherBroadcastBannerProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const supabase = createClient()

    const fetchBroadcasts = async () => {
        // Query by new schema fields: target_class for class broadcasts, or visibility_scope = 'all'
        const { data: broadcasts, error } = await supabase
          .from("events")
          .select(`
            id,
            description,
            created_at,
            created_by,
            target_class,
            target_user,
            visibility_scope,
            metadata,
            sender:profiles!events_created_by_fkey (
              full_name
            )
          `)
          .in("event_type", ["broadcast", "urgent_broadcast"])
          .or(`visibility_scope.eq.all,visibility_scope.eq.class.and.target_class.eq.${classId}`)
          .order("created_at", { ascending: false })
          .limit(10)

      if (broadcasts) {
        // Ensure compatibility: some rows use `description` while component expects `message`.
        const normalized = broadcasts.map((b: any) => ({
          ...b,
          message: b.message ?? b.description ?? b.metadata?.title ?? "",
        }))
        setBroadcasts(normalized)
      }
    }

    fetchBroadcasts()

    // Subscribe to new broadcasts
    const channel = supabase
      .channel("teacher-broadcasts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          // subscribe to inserts where target_class = this class OR visibility_scope = 'all'
          filter: `target_class=eq.${classId}`
        },
        (payload) => {
          const b = payload.new as any
          const normalized = { ...b, message: b.message ?? b.description ?? b.metadata?.title ?? "" }
          setBroadcasts(prev => [normalized as Broadcast, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, classId])

  const handleDismiss = (broadcastId: string) => {
    setDismissed(prev => new Set([...prev, broadcastId]))
  }

  const visibleBroadcasts = broadcasts.filter(b => !dismissed.has(b.id))

  if (visibleBroadcasts.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <div className="divide-y">
        {visibleBroadcasts.map((broadcast) => {
          const isUrgent = broadcast.metadata?.isUrgent
          const formattedTime = format(new Date(broadcast.created_at), "MMM d, h:mm a")
          const teacherName = broadcast.metadata?.teacher_name || "Your Teacher"
          
          return (
            <div
              key={broadcast.id}
              className={`p-4 ${isUrgent ? 'bg-red-50' : 'bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full ${isUrgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {isUrgent ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Megaphone className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {broadcast.metadata?.title || "Class Announcement"}
                      </h3>
                      {isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${isUrgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {broadcast.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      From {teacherName} • {formattedTime}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(broadcast.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
