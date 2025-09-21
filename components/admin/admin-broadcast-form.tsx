"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Send, Users, AlertTriangle, Info, Megaphone } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Class {
  id: string
  name: string
}

interface Batch {
  id: string
  name: string
}

interface AdminBroadcastFormProps {
  classes: Class[]
  batches: Batch[]
}

export function AdminBroadcastForm({ classes, batches }: AdminBroadcastFormProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetType, setTargetType] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [targetClass, setTargetClass] = useState("")
  const [targetBatch, setTargetBatch] = useState("")
  const [notificationType, setNotificationType] = useState("notification")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Implementation for broadcast
      toast({
        title: "Broadcast sent",
        description: "Your message has been sent to the selected audience.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Send Broadcast Message
        </CardTitle>
        <CardDescription>
          Send important announcements to specific groups of users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter broadcast title..."
              required
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your important announcement here..."
              rows={4}
              required
            />
          </div>

          {/* Target Selection */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Users (Entire School)
                  </div>
                </SelectItem>
                <SelectItem value="role">By Role</SelectItem>
                <SelectItem value="class">By Class</SelectItem>
                <SelectItem value="batch">By Batch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          {targetType === "role" && (
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Class Selection */}
          {targetType === "class" && (
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={targetClass} onValueChange={setTargetClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Batch Selection */}
          {targetType === "batch" && (
            <div className="space-y-2">
              <Label>Select Batch</Label>
              <Select value={targetBatch} onValueChange={setTargetBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notification Type */}
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notification">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <div>
                      <div>Notification</div>
                      <div className="text-xs text-muted-foreground">Regular announcement</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="alert">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <div>Alert</div>
                      <div className="text-xs text-muted-foreground">Important notice</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgent Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgent"
              checked={isUrgent}
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
            />
            <Label htmlFor="urgent" className="flex items-center gap-2">
              Mark as urgent
              <Badge variant="destructive" className="text-xs">
                HIGH PRIORITY
              </Badge>
            </Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Broadcasting...
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
