"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasksPerUser, setTasksPerUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [totalTasks, setTotalTasks] = useState(0)
  const [openedTasks, setOpenedTasks] = useState(0)
  const [closedTasks, setClosedTasks] = useState(0)

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks-per-user')
      if (response.ok) {
        const data = await response.json()
        setTasksPerUser(data)
        calculateTaskStats(data)
      } else {
        setError("Failed to fetch tasks per user")
      }
    } catch (err) {
      console.error("Error fetching tasks per user:", err)
      setError("An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }

  const calculateTaskStats = (data: any) => {
    let total = 0
    let opened = 0
    let closed = 0

    Object.values(data).forEach(({ tasks }: any) => {
      total += tasks.length
      tasks.forEach((task: any) => {
        if (task.status === 'Open') {
          opened++
        } else if (task.status === 'Closed') {
          closed++
        }
      })
    })

    setTotalTasks(total)
    setOpenedTasks(opened)
    setClosedTasks(closed)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/tasks/create')}>New Task</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Opened Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{openedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Closed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{closedTasks}</p>
          </CardContent>
        </Card>
      </div>
      <div>
        {Object.entries(tasksPerUser).map(([userId, { user, tasks }]) => (
          <Card key={userId}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{/* Calculate SLA compliance */}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
