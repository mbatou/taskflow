"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, BarChart } from "@/components/ui/charts"
import { getSLAMetrics } from "@/utils/sla"

interface DashboardData {
  taskDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  slaMetrics: {
    completedOnTimePercentage: number;
    overduePercentage: number;
  };
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    const [tasksResponse, slaMetrics] = await Promise.all([
      fetch("/api/tasks/summary"),
      getSLAMetrics(),
    ])
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json()
      setDashboardData({ ...tasksData, slaMetrics })
    }
  }

  if (!dashboardData) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/tasks/create')}>New Task</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={dashboardData.taskDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={[
              { name: "Completed on Time", value: dashboardData.slaMetrics.completedOnTimePercentage },
              { name: "Overdue", value: dashboardData.slaMetrics.overduePercentage },
            ]} />
          </CardContent>
        </Card>
        {/* Add more cards for other metrics */}
      </div>
    </div>
  )
}
