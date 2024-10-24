import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const taskDistribution = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const formattedDistribution = {
      labels: taskDistribution.map(item => item.status),
      datasets: [{
        data: taskDistribution.map(item => item._count.status),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }],
    }

    return NextResponse.json({ taskDistribution: formattedDistribution })
  } catch (error) {
    console.error('Error fetching task summary:', error)
    return NextResponse.json({ error: 'Error fetching task summary' }, { status: 500 })
  }
}
