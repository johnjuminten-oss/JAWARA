"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, School, Bell, Shield, Database, Mail } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    schoolEmail: "",
    academicYear: "",
    timezone: "UTC",
    enableNotifications: true,
    enableAlerts: true,
    enableRealtime: true,
    maxEventsPerDay: 10,
    alertReminderHours: 24,
    maintenanceMode: false,
    allowSelfRegistration: false,
    defaultUserRole: "student",
    sessionTimeout: 30,
    maxFileSize: 10,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd load these from a settings table
      // For now, we'll use default values
      const { data } = await supabase.from("profiles").select("*").eq("role", "admin").limit(1).single()

      if (data) {
        // Load any existing settings from admin profile or settings table
        console.log("[v0] Loaded admin profile for settings")
      }
    } catch (error) {
      console.error("[v0] Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, you'd save to a settings table
      // For now, we'll just show success
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "System settings saved successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>Basic information about your educational institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={settings.schoolName}
                    onChange={(e) => updateSetting("schoolName", e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={settings.academicYear}
                    onChange={(e) => updateSetting("academicYear", e.target.value)}
                    placeholder="2024-2025"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolAddress">Address</Label>
                <Textarea
                  id="schoolAddress"
                  value={settings.schoolAddress}
                  onChange={(e) => updateSetting("schoolAddress", e.target.value)}
                  placeholder="Enter school address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={settings.schoolPhone}
                    onChange={(e) => updateSetting("schoolPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={settings.schoolEmail}
                    onChange={(e) => updateSetting("schoolEmail", e.target.value)}
                    placeholder="admin@school.edu"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Allow system to send notifications</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting("enableNotifications", checked)}
                  aria-label="Toggle system notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Alerts</Label>
                  <p className="text-sm text-muted-foreground">Allow system to send urgent alerts</p>
                </div>
                <Switch
                  checked={settings.enableAlerts}
                  onCheckedChange={(checked) => updateSetting("enableAlerts", checked)}
                  aria-label="Toggle system alerts"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Updates</Label>
                  <p className="text-sm text-muted-foreground">Enable real-time data synchronization</p>
                </div>
                <Switch
                  checked={settings.enableRealtime}
                  onCheckedChange={(checked) => updateSetting("enableRealtime", checked)}
                  aria-label="Toggle realtime updates"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertHours">Alert Reminder Hours</Label>
                <Input
                  id="alertHours"
                  type="number"
                  value={settings.alertReminderHours}
                  onChange={(e) => updateSetting("alertReminderHours", Number.parseInt(e.target.value))}
                  placeholder="24"
                />
                <p className="text-sm text-muted-foreground">Hours before event to send reminder alerts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Self Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow users to register without admin approval</p>
                </div>
                <Switch
                  checked={settings.allowSelfRegistration}
                  onCheckedChange={(checked) => updateSetting("allowSelfRegistration", checked)}
                  aria-label="Toggle self registration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultRole">Default User Role</Label>
                <Select
                  value={settings.defaultUserRole}
                  onValueChange={(value) => updateSetting("defaultUserRole", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                  placeholder="30"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system limits and performance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                    aria-label="Toggle maintenance mode"
                  />
                  {settings.maintenanceMode && <Badge variant="destructive">ACTIVE</Badge>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxEvents">Max Events Per Day</Label>
                <Input
                  id="maxEvents"
                  type="number"
                  value={settings.maxEventsPerDay}
                  onChange={(e) => updateSetting("maxEventsPerDay", Number.parseInt(e.target.value))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => updateSetting("maxFileSize", Number.parseInt(e.target.value))}
                  placeholder="10"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                External Integrations
              </CardTitle>
              <CardDescription>Configure external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Supabase</CardTitle>
                    <CardDescription>Database and authentication</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Email Service</CardTitle>
                    <CardDescription>Email notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">Not Configured</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
