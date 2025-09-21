"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Search, Users, GraduationCap, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"

interface Student {
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

interface AssignmentForm {
  batch_id: string
  class_id: string
}

export function StudentAssignment() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    batch_id: "",
    class_id: "",
  })

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [{ data: studentsData }, { data: batchesData }, { data: classesData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false }),
        supabase.from("batches").select("*").order("name"),
        supabase.from("classes").select("*").order("name"),
      ])

      setStudents(studentsData || [])
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

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.batch_id && batches.find(b => b.id === student.batch_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.class_id && classes.find(c => c.id === student.class_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getBatchName = (batchId?: string) => {
    if (!batchId) return "—"
    const batch = batches.find((b) => b.id === batchId)
    return batch?.name || "—"
  }

  const getClassName = (classId?: string) => {
    if (!classId) return "—"
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "—"
  }

  const getAssignmentStatus = (student: Student) => {
    if (student.batch_id && student.class_id) {
      return { status: "assigned", color: "bg-green-100 text-green-800", text: "Fully Assigned" }
    } else if (student.batch_id) {
      return { status: "partial", color: "bg-yellow-100 text-yellow-800", text: "Batch Only" }
    } else {
      return { status: "unassigned", color: "bg-red-100 text-red-800", text: "Unassigned" }
    }
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          batch_id: assignmentForm.batch_id || null,
          class_id: assignmentForm.class_id || null,
        })
        .eq("id", selectedStudent.id)

      if (error) throw error

      setIsDialogOpen(false)
      setSelectedStudent(null)
      setAssignmentForm({ batch_id: "", class_id: "" })
      fetchData()
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("Failed to update assignment. Please try again.")
    }
  }

  const handleBulkAssignment = async (batchId: string, classId: string) => {
    if (!confirm(`Assign all unassigned students to ${getBatchName(batchId)} - ${getClassName(classId)}?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          batch_id: batchId,
          class_id: classId,
        })
        .eq("role", "student")
        .is("batch_id", null)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error("Error bulk assigning students:", error)
      alert("Failed to bulk assign students. Please try again.")
    }
  }

  const getFilteredClasses = (batchId: string) => {
    return classes.filter((cls) => cls.batch_id === batchId)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading student assignments...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Assignment Management</h2>
          <p className="text-gray-600">Assign students to batches and classes so they can view their schedules.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Assigned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.batch_id && s.class_id).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Assigned</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.batch_id && !s.class_id).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => !s.batch_id && !s.class_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Bulk Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batches.map((batch) => (
              <div key={batch.id} className="space-y-2">
                <Label className="text-sm font-medium">{batch.name}</Label>
                <div className="space-y-2">
                  {classes.filter(c => c.batch_id === batch.id).map((cls) => (
                    <Button
                      key={cls.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleBulkAssignment(batch.id, cls.id)}
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Assign to {cls.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Assignments</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const status = getAssignmentStatus(student)
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{getBatchName(student.batch_id)}</TableCell>
                      <TableCell>{getClassName(student.class_id)}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isDialogOpen && selectedStudent?.id === student.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setAssignmentForm({
                                  batch_id: student.batch_id || "",
                                  class_id: student.class_id || "",
                                })
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Student: {student.full_name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="batch">Batch</Label>
                                <Select
                                  value={assignmentForm.batch_id}
                                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, batch_id: value, class_id: "" })}
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

                              {assignmentForm.batch_id && (
                                <div className="space-y-2">
                                  <Label htmlFor="class">Class</Label>
                                  <Select
                                    value={assignmentForm.class_id}
                                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, class_id: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getFilteredClasses(assignmentForm.batch_id).map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                          {cls.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsDialogOpen(false)
                                    setSelectedStudent(null)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit">Update Assignment</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No students found matching your search." : "No students found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
