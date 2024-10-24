"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState([])

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold">Total Tasks</h2>
                <p>{tasks.length}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold">Completed Tasks</h2>
                <p>{tasks.filter(task => task.status === "Completed").length}</p>
              </div>
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold">Overdue Tasks</h2>
                <p>{tasks.filter(task => task.status === "Overdue").length}</p>
              </div>
            </div>
            <Button className="mt-4" onClick={() => router.push("/dashboard/tasks")}>
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
