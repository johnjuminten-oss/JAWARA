"use client"

import { useState, useEffect, useCallback } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Send, Users, AlertTriangle, Info } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface BroadcastFormProps {
  userRole: string
  userId: string
}

export function BroadcastForm({ userRole, userId }: BroadcastFormProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetType, setTargetType] = useState<"all" | "role" | "class" | "batch">("all")
  const [targetRole, setTargetRole] = useState("")
  const [targetClass, setTargetClass] = useState("")
  const [targetBatch, setTargetBatch] = useState("")
  const [notificationType, setNotificationType] = useState<"notification" | "alert">("notification")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  const supabase = createBrowserClient()

  // Load classes and batches on component mount
  const loadData = useCallback(async () => {
    try {
      const [classesRes, batchesRes] = await Promise.all([
        supabase.from("classes").select("*"),
        supabase.from("batches").select("*"),
      ])

      if (classesRes.data) setClasses(classesRes.data)
      if (batchesRes.data) setBatches(batchesRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Convert legacy form fields to new event payload shape.
      const payload: any = {
        title,
        message,
        notification_type: notificationType,
        isUrgent,
      }

      // Use new explicit fields: target_class/visibility_scope or target_user
      if (targetType === 'class') {
        payload.target_class = targetClass
        payload.visibility_scope = 'class'
      } else if (targetType === 'role') {
        // roles are not directly mapped to target_user; keep legacy role info in metadata
        payload.visibility_scope = 'all'
        payload.metadata = { target_role: targetRole }
      } else if (targetType === 'batch') {
        payload.visibility_scope = 'all'
        payload.metadata = { target_batch: targetBatch }
      } else {
        payload.visibility_scope = 'all'
      }

      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Broadcast sent successfully!",
        })
        // Reset form
        setTitle("")
        setMessage("")
        setTargetType("all")
        setNotificationType("notification")
        setIsUrgent(false)
      } else {
        throw new Error("Failed to send broadcast")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
          <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          Broadcast Message
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">Send announcements and notifications to students and staff</CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter broadcast title"
              className="w-full text-base sm:text-lg"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={4}
              className="w-full min-h-[100px] text-base sm:text-lg"
              required
            />
          </div>

          {/* Target Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Audience</Label>
            <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
              <SelectTrigger className="w-full text-base sm:text-lg">
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all" className="py-3 sm:py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">All Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="role" className="py-3 sm:py-2">
                  <span className="text-sm sm:text-base">By Role</span>
                </SelectItem>
                <SelectItem value="class" className="py-3 sm:py-2">
                  <span className="text-sm sm:text-base">By Class</span>
                </SelectItem>
                <SelectItem value="batch" className="py-3 sm:py-2">
                  <span className="text-sm sm:text-base">By Batch</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          {targetType === "role" && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Select Role</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger className="w-full text-base sm:text-lg">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="student" className="py-3 sm:py-2">
                    <span className="text-sm sm:text-base">Students</span>
                  </SelectItem>
                  <SelectItem value="teacher" className="py-3 sm:py-2">
                    <span className="text-sm sm:text-base">Teachers</span>
                  </SelectItem>
                  {userRole === "admin" && (
                    <SelectItem value="admin" className="py-3 sm:py-2">
                      <span className="text-sm sm:text-base">Admins</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Class Selection */}
          {targetType === "class" && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Select Class</Label>
              <Select value={targetClass} onValueChange={setTargetClass}>
                <SelectTrigger className="w-full text-base sm:text-lg">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="py-3 sm:py-2">
                      <span className="text-sm sm:text-base">{cls.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Batch Selection */}
          {targetType === "batch" && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Select Batch</Label>
              <Select value={targetBatch} onValueChange={setTargetBatch}>
                <SelectTrigger className="w-full text-base sm:text-lg">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id} className="py-3 sm:py-2">
                      <span className="text-sm sm:text-base">{batch.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notification Type */}
          <div className="space-y-2 mt-6">
            <Label className="text-sm font-medium">Notification Type</Label>
            <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
              <SelectTrigger className="w-full text-base sm:text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[300px] sm:w-[350px]">
                <SelectItem value="notification" className="py-3 sm:py-2">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium">Notification</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Regular announcement</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="alert" className="py-3 sm:py-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium">Alert</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Important notice</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgent Checkbox */}
          <div className="flex items-center space-x-3 mt-6">
            <Checkbox 
              id="urgent" 
              checked={isUrgent} 
              onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
              className="h-5 w-5" 
            />
            <Label 
              htmlFor="urgent" 
              className="flex items-center gap-2 text-sm sm:text-base cursor-pointer select-none"
            >
              <span>Mark as urgent</span>
              <Badge variant="destructive" className="text-[10px] sm:text-xs px-2 py-0.5">
                HIGH PRIORITY
              </Badge>
            </Label>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full mt-8 h-11 text-base sm:text-lg font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-3" />
                <span>Send Broadcast</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
