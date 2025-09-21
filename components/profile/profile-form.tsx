"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface ProfileFormProps {
  profile: {
    id: string
    email: string
    full_name: string
    role: string
    batch_id?: string
    class_id?: string
  }
  batches?: Array<{ id: string; name: string }>
  classes?: Array<{ id: string; name: string; batch_id: string }>
  canEditRole?: boolean
  onSuccess?: () => void
}

export function ProfileForm({ profile, batches = [], classes = [], canEditRole = false, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
    batch_id: profile.batch_id || "",
    class_id: profile.class_id || "",
  })

  const filteredClasses = classes.filter((cls) => cls.batch_id === formData.batch_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      }

      if (canEditRole) {
        updateData.role = formData.role
        updateData.batch_id = formData.batch_id || null
        updateData.class_id = formData.class_id || null
      }

      const { error: updateError } = await supabase.from("profiles").update(updateData).eq("id", profile.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
      onSuccess?.()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {canEditRole && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.role === "student" || formData.role === "teacher") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch</Label>
                    <Select
                      value={formData.batch_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, batch_id: value, class_id: "" }))}
                    >
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

                  {formData.batch_id && (
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, class_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Notification Preferences</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive alerts and reminders via email</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} aria-label="Toggle email notifications" />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
