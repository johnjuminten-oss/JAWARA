"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScheduleTypeSelector } from "@/components/teacher/schedule-type-selector"

interface ScheduleTypeSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectType: (type: 'student' | 'personal') => void
}

export function ScheduleTypeSelectorModal({ isOpen, onClose, onSelectType }: ScheduleTypeSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Schedule</DialogTitle>
        </DialogHeader>
        <ScheduleTypeSelector 
          onSelectType={(type) => {
            onSelectType(type)
            onClose()
          }} 
        />
      </DialogContent>
    </Dialog>
  )
}
