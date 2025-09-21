import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Class, ClassWithEnrollment } from '@/types/database'

interface UseClassDataReturn {
  isLoading: boolean
  error: Error | null
  classData: ClassWithEnrollment | null
  updateCapacity: (capacity: number) => Promise<void>
  fetchClassData: () => Promise<void>
}

export function useClassData(classId: string): UseClassDataReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [classData, setClassData] = useState<ClassWithEnrollment | null>(null)

  const fetchClassData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('classes')
        .select('*, current_enrollment:class_enrollments(count)')
        .eq('id', classId)
        .single()

      if (error) throw error

      setClassData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch class data'))
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  const updateCapacity = useCallback(async (capacity: number) => {
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('classes')
        .update({ capacity })
        .eq('id', classId)

      if (error) throw error

      // Refresh class data after update
      await fetchClassData()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update capacity'))
      throw err
    }
  }, [classId, fetchClassData])

  return {
    isLoading,
    error,
    classData,
    updateCapacity,
    fetchClassData,
  }
}
