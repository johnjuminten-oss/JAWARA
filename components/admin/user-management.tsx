"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProfileForm } from "@/components/profile/profile-form"
import { createClient } from "@/lib/supabase/client"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  batch_id?: string
  class_id?: string
  created_at: string
}

interface Batch {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
  batch_id: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [{ data: usersData }, { data: batchesData }, { data: classesData }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("batches").select("*").order("name"),
        supabase.from("classes").select("*").order("name"),
      ])

      setUsers(usersData || [])
      setBatches(batchesData || [])
      setClasses(classesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "teacher":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBatchName = (batchId?: string) => {
    if (!batchId) return "-"
    const batch = batches.find((b) => b.id === batchId)
    return batch?.name || "-"
  }

  const getClassName = (classId?: string) => {
    if (!classId) return "-"
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "-"
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      setUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user. Please try again.")
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading users...</div>
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-gray-600">
                New users can be added through the sign-up process. Use this interface to manage existing users.
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{getBatchName(user.batch_id)}</TableCell>
                  <TableCell>{getClassName(user.class_id)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit User Profile</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <ProfileForm
                              profile={selectedUser}
                              batches={batches}
                              classes={classes}
                              canEditRole={true}
                              onSuccess={() => {
                                fetchData()
                                setSelectedUser(null)
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No users found matching your search." : "No users found."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
