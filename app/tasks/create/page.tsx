"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "sonner"

const departments = ["Finance", "Marketing & Strategy", "Operations", "Administration", "Graphic Design"]

interface User {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  department: string;
  assignedTo: string;
  deadline: string;
  attachments: string[];
}

export default function CreateTask() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    department: "",
    assignedTo: "",
    deadline: "",
    attachments: [],
  })

  useEffect(() => {
    // Fetch all users regardless of department
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: session?.user?.id,
        attachments: formData.attachments.length > 0 ? formData.attachments : [], // Ensure it's always an array
      }),
    })

    if (response.ok) {
      toast.success("Task created successfully")
      router.push("/dashboard/tasks")
    } else {
      const errorData = await response.json()
      toast.error(`Failed to create task: ${errorData.error}`)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    const uploadedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (response.ok) {
          const { url } = await response.json()
          return url
        }
        return null
      })
    )
    setFormData({ ...formData, attachments: [...formData.attachments, ...uploadedFiles.filter(Boolean) as string[]] })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Select
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            onChange={(date) => setFormData({ ...formData, deadline: date.toISOString() })}
            required
          />
          <FileUpload
            onUpload={handleFileUpload}
            multiple
            accept=".pdf,.jpeg,.jpg,.png,.docx"
            maxSize={10 * 1024 * 1024} // 10MB limit
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/tasks")}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
