"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"

const departments = ["Finance", "Marketing & Strategy", "Operations", "Administration", "Graphic Design"]

export default function CreateTask() {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    assignedTo: "",
    deadline: "",
    attachments: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Call API to create task
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      toast.success("Task created successfully")
      router.push("/dashboard/tasks")
    } else {
      toast.error("Failed to create task")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <Select
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </Select>
              {/* Add more fields for assigned user, deadline, and attachments */}
              <Button type="submit">Submit</Button>
              <Button type="button" onClick={() => router.push("/dashboard/tasks")}>
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
