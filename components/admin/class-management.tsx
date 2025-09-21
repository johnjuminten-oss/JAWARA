"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Batch {
  id: string
  name: string
  year: number
}

interface Class {
  id: string
  name: string
  batch_id: string
  grade_level: number
  created_at: string
}

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classForm, setClassForm] = useState({
    name: "",
    batch_id: "",
    grade_level: 10
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [classesResult, batchesResult] = await Promise.all([
        supabase
          .from("classes")
          .select("*")
          .order("name"),
        supabase
          .from("batches")
          .select("*")
          .order("year", { ascending: false })
      ])

      if (classesResult.error) throw classesResult.error
      if (batchesResult.error) throw batchesResult.error

      setClasses(classesResult.data || [])
      setBatches(batchesResult.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classForm.name || !classForm.batch_id) return

    try {
      const supabase = createClient()
      
      if (selectedClass) {
        const { error } = await supabase
          .from("classes")
          .update({
            name: classForm.name,
            batch_id: classForm.batch_id,
            grade_level: classForm.grade_level
          })
          .eq("id", selectedClass.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("classes")
          .insert({
            name: classForm.name,
            batch_id: classForm.batch_id,
            grade_level: classForm.grade_level
          })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setSelectedClass(null)
      setClassForm({ name: "", batch_id: "", grade_level: 10 })
      fetchData()
    } catch (error) {
      console.error("Error saving class:", error)
      alert("Failed to save class. Please try again.")
    }
  }

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls)
    setClassForm({
      name: cls.name,
      batch_id: cls.batch_id,
      grade_level: cls.grade_level
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (classId: string) => {
    if (!confirm("Are you sure? This will delete all associated assignments.")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error deleting class:", error)
      alert("Failed to delete class. Please try again.")
    }
  }

  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId)
    return batch?.name || "Unknown Batch"
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading classes...</div>
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Classes</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  value={classForm.batch_id}
                  onValueChange={(value) => setClassForm(prev => ({ ...prev, batch_id: value }))}
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
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={classForm.name}
                  onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Kelas 10A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input
                  id="grade_level"
                  type="number"
                  min="7"
                  max="12"
                  value={classForm.grade_level}
                  onChange={(e) => setClassForm(prev => ({ ...prev, grade_level: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {selectedClass ? "Update Class" : "Create Class"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Grade Level</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{getBatchName(cls.batch_id)}</TableCell>
                <TableCell>{cls.grade_level}</TableCell>
                <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cls)}
                    className="mr-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
