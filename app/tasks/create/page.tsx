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

const taskTypes = {
  "Marketing & Strategy": ["Campaign", "Social Media Post", "Ad Creation"],
  "Graphic Design": ["Content Creation", "Design Request"],
  "Finance": ["Budget Approval", "Invoice Request"],
  "Operations": ["Logistics Setup", "Resource Allocation"],
  "Administration": ["Meeting Setup", "HR Request"],
}

interface User {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  department: string;
  taskType: string;
  assignedTo: string;
  deadline: string;
  attachments: string[];
  [key: string]: any;
}

export default function CreateTask() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    department: "",
    taskType: "",
    assignedTo: "",
    deadline: "",
    attachments: [],
  })

  useEffect(() => {
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

  const renderDynamicFields = () => {
    switch (formData.taskType) {
      case "Campaign":
        return (
          <>
            <Input
              placeholder="Brand"
              value={formData.brand || ""}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
            <Select onValueChange={(value) => setFormData({ ...formData, platform: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {["Facebook", "Instagram", "LinkedIn", "Twitter"].map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FileUpload
              onUpload={(files) => handleFileUpload(files)}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB limit
            />
            <Textarea
              placeholder="Caption"
              value={formData.caption || ""}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              required
            />
            <Input
              placeholder="Call to Action"
              value={formData.callToAction || ""}
              onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
              required
            />
          </>
        )
      // Add cases for other task types here
      default:
        return null
    }
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
            onValueChange={(value) => setFormData({ ...formData, department: value, taskType: "" })}
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
          {formData.department && (
            <Select
              onValueChange={(value) => setFormData({ ...formData, taskType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Task Type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes[formData.department as keyof typeof taskTypes].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {renderDynamicFields()}
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
