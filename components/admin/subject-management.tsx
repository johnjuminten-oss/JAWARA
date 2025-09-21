"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Subject {
  id: string
  name: string
  code?: string | null
  description?: string | null
  created_at?: string
}

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", code: "", description: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", code: "", description: "" })
  const [mapOpen, setMapOpen] = useState(false)
  const [mapSubjectId, setMapSubjectId] = useState<string | null>(null)
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([])
  const [mapForm, setMapForm] = useState<{ class_id: string; teacher_id: string | null }>({ class_id: "", teacher_id: null })

  const supabase = createClient()

  const loadSubjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("is_deleted", false)
        .order("name")
      if (error) throw error
      setSubjects(data || [])
    } catch (err: any) {
      console.error("Failed to load subjects", err)
      toast({ title: "Failed", description: "Could not load subjects", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const loadTeachersAndClasses = useCallback(async () => {
    try {
      const { data: cls } = await supabase.from("classes").select("id,name").order("name")
      setClasses(cls || [])
      const { data: tchs } = await supabase.from("profiles").select("id,full_name").eq("role", "teacher").order("full_name")
      setTeachers(tchs || [])
    } catch {}
  }, [supabase])

  useEffect(() => {
    loadSubjects()
    loadTeachersAndClasses()
  }, [loadSubjects, loadTeachersAndClasses])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter subject name", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      const { error } = await supabase.from("subjects").insert({
        name: form.name.trim(),
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        is_deleted: false,
      })
      if (error) throw error
      setForm({ name: "", code: "", description: "" })
      await loadSubjects()
      toast({ title: "Created", description: "Subject added successfully" })
    } catch (err: any) {
      console.error("Create subject failed", err)
      toast({ title: "Failed", description: "Could not create subject", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (s: Subject) => {
    setEditingId(s.id)
    setEditForm({ name: s.name || "", code: s.code || "", description: s.description || "" })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase.from("subjects").update({
        name: editForm.name.trim(),
        code: editForm.code.trim() || null,
        description: editForm.description.trim() || null,
      }).eq("id", id)
      if (error) throw error
      toast({ title: "Updated", description: "Subject updated" })
      setEditingId(null)
      await loadSubjects()
    } catch (err: any) {
      console.error("Update subject failed", err)
      toast({ title: "Failed", description: "Could not update subject", variant: "destructive" })
    }
  }

  const deleteSubject = async (id: string) => {
    if (!confirm("Delete this subject?")) return
    try {
      const { error } = await supabase.from("subjects").update({ is_deleted: true }).eq("id", id)
      if (error) throw error
      toast({ title: "Deleted", description: "Subject removed" })
      await loadSubjects()
    } catch (err: any) {
      console.error("Delete subject failed", err)
      toast({ title: "Failed", description: "Could not delete subject", variant: "destructive" })
    }
  }

  const openMap = (subjectId: string) => {
    setMapSubjectId(subjectId)
    setMapForm({ class_id: "", teacher_id: null })
    setMapOpen(true)
  }

  const saveMapping = async () => {
    if (!mapSubjectId || !mapForm.class_id) {
      toast({ title: "Class required", description: "Please choose a class", variant: "destructive" })
      return
    }
    try {
      const payload: any = { class_id: mapForm.class_id, subject_id: mapSubjectId }
      if (mapForm.teacher_id) payload.teacher_id = mapForm.teacher_id
      const { error } = await supabase.from("class_subjects").insert(payload)
      if (error) throw error
      toast({ title: "Mapped", description: "Subject linked to class" })
      setMapOpen(false)
    } catch (err: any) {
      console.error("Map subject failed", err)
      toast({ title: "Failed", description: "Could not map subject", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subjects</h2>
      </div>

      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Add Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Matematika" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., MATH" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={creating}>{creating ? "Saving..." : "Add Subject"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No subjects yet</div>
          ) : (
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {editingId === s.id ? (
                          <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        ) : s.name}
                      </TableCell>
                      <TableCell>
                        {editingId === s.id ? (
                          <Input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
                        ) : (s.code || "—")}
                      </TableCell>
                      <TableCell>
                        {editingId === s.id ? (
                          <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        ) : (s.description || "—")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingId === s.id ? (
                          <>
                            <Button size="sm" onClick={() => saveEdit(s.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEdit(s)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteSubject(s.id)}>Delete</Button>
                            <Button size="sm" onClick={() => openMap(s.id)}>Map to Class</Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Map Subject to Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={mapForm.class_id} onValueChange={(v) => setMapForm({ ...mapForm, class_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher (optional)</Label>
              <Select value={mapForm.teacher_id || ""} onValueChange={(v) => setMapForm({ ...mapForm, teacher_id: v || null })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveMapping}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubjectManagement


