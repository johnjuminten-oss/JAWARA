"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Batch {
  id: string
  name: string
  year: number
  created_at: string
}

export function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [batchForm, setBatchForm] = useState({
    name: "",
    year: new Date().getFullYear()
  })

  const fetchBatches = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .order("year", { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error("Error fetching batches:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchForm.name || !batchForm.year) return

    try {
      const supabase = createClient()
      
      if (selectedBatch) {
        const { error } = await supabase
          .from("batches")
          .update({
            name: batchForm.name,
            year: batchForm.year
          })
          .eq("id", selectedBatch.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("batches")
          .insert({
            name: batchForm.name,
            year: batchForm.year
          })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setSelectedBatch(null)
      setBatchForm({ name: "", year: new Date().getFullYear() })
      fetchBatches()
    } catch (error) {
      console.error("Error saving batch:", error)
      alert("Failed to save batch. Please try again.")
    }
  }

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch)
    setBatchForm({
      name: batch.name,
      year: batch.year
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (batchId: string) => {
    if (!confirm("Are you sure? This will delete all associated classes and assignments.")) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", batchId)

      if (error) throw error
      fetchBatches()
    } catch (error) {
      console.error("Error deleting batch:", error)
      alert("Failed to delete batch. Please try again.")
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading batches...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Batches</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedBatch ? "Edit Batch" : "Add New Batch"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Batch Name</Label>
                <Input
                  id="name"
                  value={batchForm.name}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Angkatan 2025"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={batchForm.year}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {selectedBatch ? "Update Batch" : "Create Batch"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell>{batch.year}</TableCell>
                <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(batch)}
                    className="mr-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(batch.id)}
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
