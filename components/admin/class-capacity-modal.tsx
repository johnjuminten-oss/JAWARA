import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from '@/hooks/use-toast'

interface ClassCapacityModalProps {
  classId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapacityUpdate: () => void
}

export function ClassCapacityModal({
  classId,
  open,
  onOpenChange,
  onCapacityUpdate
}: ClassCapacityModalProps) {
  const [capacity, setCapacity] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const fetchCurrentCapacity = useCallback(async () => {
    try {
      const response = await fetch(`/api/classes/capacity?classId=${classId}`)
      if (!response.ok) throw new Error('Failed to fetch capacity')
      const data = await response.json()
      setCapacity(data.capacity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch class capacity",
        variant: "destructive",
      })
    }
  }, [classId])

  useEffect(() => {
    if (open && classId) {
      fetchCurrentCapacity()
    }
  }, [open, classId, fetchCurrentCapacity])

  const handleCapacityUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/classes/capacity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, capacity }),
      })

      if (!response.ok) throw new Error('Failed to update capacity')

      toast({
        title: "Success",
        description: "Class capacity updated successfully",
      })
      onCapacityUpdate()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class capacity",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Class Capacity</DialogTitle>
          <DialogDescription>
            Set the maximum number of students that can enroll in this class.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="capacity" className="text-right">
              Capacity
            </label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCapacityUpdate}
            disabled={loading || capacity < 1}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
