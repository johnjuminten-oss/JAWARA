"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users } from "lucide-react"

interface ScheduleTypeSelectorProps {
  onSelectType: (type: 'student' | 'personal') => void
}

export function ScheduleTypeSelector({ onSelectType }: ScheduleTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        className="p-6 cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => onSelectType('student')}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-center">Student Schedule</h3>
          <p className="text-sm text-gray-500 text-center">
            Create assignments or exams for your students
          </p>
          <Button className="w-full" variant="outline">
            Add Student Schedule
          </Button>
        </div>
      </Card>

      <Card 
        className="p-6 cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => onSelectType('personal')}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-center">Personal Schedule</h3>
          <p className="text-sm text-gray-500 text-center">
            Add private events visible only to you
          </p>
          <Button className="w-full" variant="outline">
            Add Personal Schedule
          </Button>
        </div>
      </Card>
    </div>
  )
}
