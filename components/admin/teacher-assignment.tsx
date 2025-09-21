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
import { Plus, Edit, Search, Users, GraduationCap, BookOpen, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

interface Teacher {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Class {
  id: string
  name: string
  batch_id: string
}

interface Batch {
  id: string
  name: string
}

interface TeacherAssignment {
  id: string
  teacher_id: string
  class_id: string
  subject: string
  created_at: string
}

interface AssignmentForm {
  teacher_id: string
  class_id: string
  subject: string
}

export function TeacherAssignment() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    teacher_id: "",
    class_id: "",
    subject: "",
  })

  const [subjectOptions, setSubjectOptions] = useState<string[]>([])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [{ data: teachersData }, { data: classesData }, { data: batchesData }, { data: assignmentsData }, { data: subjectsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "teacher").order("created_at", { ascending: false }),
        supabase.from("classes").select("*").order("name"),
        supabase.from("batches").select("*").order("name"),
        supabase.from("teacher_assignments").select("*").order("created_at", { ascending: false }),
        supabase.from("subjects").select("name").eq("is_deleted", false).order("name")
      ])

      setTeachers(teachersData || [])
      setClasses(classesData || [])
      setBatches(batchesData || [])
      setAssignments(assignmentsData || [])
      setSubjectOptions((subjectsData || []).map((s: any) => s.name).filter(Boolean))
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAssignments = assignments.filter(
    (assignment) => {
      const teacher = teachers.find(t => t.id === assignment.teacher_id)
      const cls = classes.find(c => c.id === assignment.class_id)
      return (
        teacher?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  )

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher?.full_name || "Unknown Teacher"
  }

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || "Unknown Class"
  }

  const getBatchName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    if (!cls) return "—"
    const batch = batches.find((b) => b.id === cls.batch_id)
    return batch?.name || "—"
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignmentForm.teacher_id || !assignmentForm.class_id || !assignmentForm.subject) return

    try {
      const supabase = createClient()
      
      if (selectedAssignment) {
        // Update existing assignment and request returned row(s)
        const result = await supabase
          .from("teacher_assignments")
          .update({
            teacher_id: assignmentForm.teacher_id,
            class_id: assignmentForm.class_id,
            subject: assignmentForm.subject,
          })
          .eq("id", selectedAssignment.id)
          .select()

        if (result.error) {
          console.error("Assignment update error:", JSON.stringify(result.error, null, 2))
          throw new Error(result.error.message || JSON.stringify(result.error))
        }
      } else {
        // Create new assignment and request returned row(s)
        const result = await supabase
          .from("teacher_assignments")
          .insert({
            teacher_id: assignmentForm.teacher_id,
            class_id: assignmentForm.class_id,
            subject: assignmentForm.subject,
          })
          .select()

        if (result.error) {
          console.error("Assignment insert error:", JSON.stringify(result.error, null, 2))
          throw new Error(result.error.message || JSON.stringify(result.error))
        }
      }

      setIsDialogOpen(false)
      setSelectedAssignment(null)
      setAssignmentForm({ teacher_id: "", class_id: "", subject: "" })
      fetchData()
    } catch (error: any) {
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      console.error("Error saving assignment:", msg)
      alert(`Failed to save assignment: ${msg}`)
    }
  }

  const handleEdit = (assignment: TeacherAssignment) => {
    setSelectedAssignment(assignment)
    setAssignmentForm({
      teacher_id: assignment.teacher_id,
      class_id: assignment.class_id,
      subject: assignment.subject,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this teacher assignment?")) return

    try {
      const supabase = createClient()
      const result = await supabase.from("teacher_assignments").delete().eq("id", assignmentId).select()

      if (result.error) {
        console.error("Assignment delete error:", JSON.stringify(result.error, null, 2))
        throw new Error(result.error.message || JSON.stringify(result.error))
      }

      fetchData()
    } catch (error: any) {
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      console.error("Error deleting assignment:", msg)
      alert(`Failed to delete assignment: ${msg}`)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading teacher assignments...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Assignments</h2>
          <p className="text-gray-600">Assign teachers to classes and subjects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assign Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAssignment ? "Edit Teacher Assignment" : "Assign Teacher to Class"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher *</Label>
                <Select
                  value={assignmentForm.teacher_id}
                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, teacher_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={assignmentForm.class_id}
                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({batches.find(b => b.id === cls.batch_id)?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  list="subjects-list"
                  placeholder="Type or choose a subject"
                  value={assignmentForm.subject}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                />
                <datalist id="subjects-list">
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedAssignment(null)
                    setAssignmentForm({ teacher_id: "", class_id: "", subject: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedAssignment ? "Update Assignment" : "Assign Teacher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by teacher, class, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Current Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {getTeacherName(assignment.teacher_id)}
                    </TableCell>
                    <TableCell>{getClassName(assignment.class_id)}</TableCell>
                    <TableCell>{getBatchName(assignment.class_id)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{assignment.subject}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAssignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No assignments found matching your search." : "No teacher assignments found. Create your first assignment to get started."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
