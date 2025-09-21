"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Users } from "lucide-react"
import { ClassCapacityModal } from "./class-capacity-modal"
import { useEffect, useState } from "react"

interface Batch {
  id: string
  name: string
  created_at: string
}

interface Class {
  id: string
  name: string
  batch_id: string
  created_at: string
  capacity?: number
  is_active: boolean
}

export function BatchClassManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newBatchName, setNewBatchName] = useState("")
  const [newClassName, setNewClassName] = useState("")
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [showCapacityModal, setShowCapacityModal] = useState(false)

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const [{ data: batchesData }, { data: classesData }] = await Promise.all([
        supabase.from("batches").select("*").order("created_at", { ascending: false }),
        supabase.from("classes").select("*").order("created_at", { ascending: false }),
      ])

      setBatches(batchesData || [])
      setClasses(classesData || [])
    } catch (error: unknown) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchName.trim()) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("batches").insert({ name: newBatchName.trim() })

      if (error) throw error

      setNewBatchName("")
      fetchData()
    } catch (error: unknown) {
      console.error("Error adding batch:", error)
      alert("Failed to add batch. Please try again.")
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim() || !selectedBatchId) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("classes").insert({
        name: newClassName.trim(),
        batch_id: selectedBatchId,
        is_active: true,
        capacity: 30 // Default capacity
      });

      if (error) throw error

      setNewClassName("")
      setSelectedBatchId("")
      fetchData()
    } catch (error: unknown) {
      console.error("Error adding class:", error)
      alert("Failed to add class. Please try again.")
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this batch? This will also delete all associated classes.")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("batches").delete().eq("id", batchId)

      if (error) throw error

      fetchData()
    } catch (error: unknown) {
      console.error("Error deleting batch:", error)
      alert("Failed to delete batch. Please try again.")
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("classes").delete().eq("id", classId)

      if (error) throw error

      fetchData()
    } catch (error: unknown) {
      console.error("Error deleting class:", error)
      alert("Failed to delete class. Please try again.")
    }
  }

  const getBatchName = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId)
    return batch?.name || "Unknown Batch"
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Batches */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Batches</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Batch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBatch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch-name">Batch Name</Label>
                    <Input
                      id="batch-name"
                      placeholder="e.g., Batch 2024"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Batch
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Classes */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Classes</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-name">Class Name</Label>
                    <Input
                      id="class-name"
                      placeholder="e.g., Class 10A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-select">Batch</Label>
                    <select
                      id="batch-select"
                      className="w-full p-2 border rounded-md"
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      required
                    >
                      <option value="">Select a batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Add Class
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{getBatchName(cls.batch_id)}</TableCell>
                    <TableCell>{cls.capacity || '-'}</TableCell>
                    <TableCell>{new Date(cls.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setShowCapacityModal(true);
                          }}
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClass(cls.id)}
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
        </CardContent>
      </Card>

      {showCapacityModal && selectedClassId && (
        <ClassCapacityModal
          classId={selectedClassId}
          open={showCapacityModal}
          onOpenChange={setShowCapacityModal}
          onCapacityUpdate={fetchData}
        />
      )}
    </div>
  )
}
