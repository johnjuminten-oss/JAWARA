import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from '@/hooks/use-toast'

interface EventVisibilityProps {
  eventId: string
  initialVisibility?: 'personal' | 'class' | 'schoolwide'
  onVisibilityChange?: (newScope: 'personal' | 'class' | 'schoolwide') => void
  className?: string
}

export function EventVisibility({
  eventId,
  initialVisibility = 'personal',
  onVisibilityChange,
  className
}: EventVisibilityProps) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [loading, setLoading] = useState(false)

  const handleVisibilityChange = async (value: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/events/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          visibility_scope: value
        }),
      })

      if (!response.ok) throw new Error('Failed to update visibility')

  setVisibility(value as 'personal' | 'class' | 'schoolwide')
      toast({
        title: "Success",
        description: "Event visibility updated successfully",
      })
  onVisibilityChange?.(value as 'personal' | 'class' | 'schoolwide')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event visibility",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={visibility}
        onValueChange={handleVisibilityChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="class">Class</SelectItem>
          <SelectItem value="schoolwide">School-wide</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
