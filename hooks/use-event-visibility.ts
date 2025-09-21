import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Event, EventWithClass, VisibilityScope } from '@/types/database'

interface UseEventVisibilityReturn {
  isLoading: boolean
  error: Error | null
  events: EventWithClass[]
  updateVisibility: (eventId: string, visibility: VisibilityScope) => Promise<void>
  fetchEvents: (scope: VisibilityScope, userId: string) => Promise<void>
}

export function useEventVisibility(): UseEventVisibilityReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [events, setEvents] = useState<EventWithClass[]>([])

  const fetchEvents = useCallback(async (scope: VisibilityScope, userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('events')
        .select('*, class:classes(name)')

      switch (scope) {
        case 'personal':
          query = query.eq('user_id', userId)
          break
        case 'class':
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

          if (profile?.role === 'student') {
            const { data: enrollments } = await supabase
              .from('class_enrollments')
              .select('class_id')
              .eq('student_id', userId)

            const classIds = enrollments?.map(e => e.class_id) || []
            query = query
              .eq('visibility_scope', 'class')
              .in('class_id', classIds)
          }
          break
        case 'schoolwide':
          query = query.eq('visibility_scope', 'schoolwide')
          break
      }

      const { data, error } = await query

      if (error) throw error

      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateVisibility = useCallback(async (eventId: string, visibility: VisibilityScope) => {
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('events')
        .update({ visibility_scope: visibility })
        .eq('id', eventId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update visibility'))
      throw err
    }
  }, [])

  return {
    isLoading,
    error,
    events,
    updateVisibility,
    fetchEvents,
  }
}
