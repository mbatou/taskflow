import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        tasks: true,
      },
    })

    const userTaskCounts = users.map(user => ({
      name: user.name,
      openTasks: user.tasks.filter(task => task.status !== 'Completed').length,
      closedTasks: user.tasks.filter(task => task.status === 'Completed').length,
    }))

    return NextResponse.json(userTaskCounts)
  } catch (error) {
    console.error('Error fetching user task counts:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
