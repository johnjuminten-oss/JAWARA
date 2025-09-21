"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Send, AlertTriangle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface TeacherBroadcastFormProps {
  teacherId: string
  teacherName: string
  assignedClasses: {
    id: string
    name: string
  }[]
}

export function TeacherBroadcastForm({ teacherId, teacherName, assignedClasses }: TeacherBroadcastFormProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message",
        variant: "destructive",
      })
      return
    }

    if (selectedClasses.length === 0) {
      toast({
        title: "No Classes Selected",
        description: "Please select at least one class",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // Create a broadcast for each selected class using new schema fields
      const broadcastPromises = selectedClasses.map(classId =>
        fetch("/api/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            message,
            target_class: classId,
            visibility_scope: 'class',
            isUrgent,
            metadata: {
              title,
              isUrgent,
              teacher_name: teacherName,
              class_id: classId
            }
          }),
        })
      )

      await Promise.all(broadcastPromises)

      toast({
        title: "Success",
        description: "Broadcast sent to selected classes",
        variant: "default",
        action: (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Sent Successfully
          </div>
        ),
      })

      // Reset form
      setTitle("")
      setMessage("")
      setSelectedClasses([])
      setIsUrgent(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const toggleClass = (classId: string) => {
    setSelectedClasses(current =>
      current.includes(classId)
        ? current.filter(id => id !== classId)
        : [...current, classId]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Class Announcement
        </CardTitle>
        <CardDescription>
          Send announcements to your assigned classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Announcement Title</Label>
            <Input
              id="title"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            <Label>Select Classes</Label>
            <div className="grid grid-cols-2 gap-4">
              {assignedClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedClasses.includes(cls.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => toggleClass(cls.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    />
                    <span>{cls.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="urgent"
                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as Urgent
                <Badge variant="destructive" className="ml-2">
                  HIGH PRIORITY
                </Badge>
              </Label>
              {isUrgent && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  Students will see this as an urgent notification
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSending || selectedClasses.length === 0}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
                {selectedClasses.length > 0 && ` to ${selectedClasses.length} class${selectedClasses.length > 1 ? 'es' : ''}`}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
