"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectItem } from "@/components/ui/select"

const statuses = ["Pending", "In Progress", "Completed", "Overdue"]

export default function TasksOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState({ status: "", department: "" })

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
    } else {
      // Fetch tasks from the backend
      fetch("/api/tasks")
        .then((res) => res.json())
        .then((data) => setTasks(data))
    }
  }, [session, router])

  const filteredTasks = tasks.filter(task => 
    (filter.status ? task.status === filter.status : true) &&
    (filter.department ? task.department === filter.department : true)
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select onValueChange={(value) => setFilter({ ...filter, status: value })}>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </Select>
              {/* Add department filter */}
            </div>
            <ul>
              {filteredTasks.map(task => (
                <li key={task.id} className="p-4 bg-white rounded shadow mb-2">
                  <h2 className="text-xl font-bold">{task.title}</h2>
                  <p>{task.description}</p>
                  <Button onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>View Details</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
