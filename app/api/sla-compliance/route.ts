import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany()

    const totalTasks = tasks.length
    const completedOnTime = tasks.filter(task => task.status === 'Completed' && !task.slaBreached).length
    const overdueTasks = tasks.filter(task => task.status === 'Overdue').length

    const slaMetrics = {
      totalTasks,
      completedOnTimePercentage: (completedOnTime / totalTasks) * 100,
      overduePercentage: (overdueTasks / totalTasks) * 100,
    }

    return NextResponse.json(slaMetrics)
  } catch (error) {
    console.error('Error fetching SLA compliance data:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
