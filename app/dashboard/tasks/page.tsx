"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Task {
  id: string;
  title: string;
  department: string;
  status: string;
  deadline: string;
  assignedTo: {
    name: string;
  };
  createdAt: string;
}

export default function TasksOverview() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState({ status: "", department: "", deadline: "" })

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, filter])

  const fetchTasks = async () => {
    const queryParams = new URLSearchParams(filter)
    const response = await fetch(`/api/tasks?${queryParams}`)
    if (response.ok) {
      const data = await response.json()
      setTasks(data)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (response.ok) {
      fetchTasks()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks Overview</CardTitle>
        <Button onClick={() => router.push('/tasks/create')}>New Task</Button>
      </CardHeader>
      <CardContent>
        {/* Filtering options */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className={task.status === "Overdue" ? "bg-red-100" : ""}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.department}</TableCell>
                <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>View</Button>
                  {session?.user?.role && (session.user.role === "Admin" || session.user.role === "Department Manager") && (
                    <Select onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <span>Change Status</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Progress">Mark In Progress</SelectItem>
                        <SelectItem value="Completed">Mark Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
