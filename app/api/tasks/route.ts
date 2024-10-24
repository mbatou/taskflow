import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const department = searchParams.get('department')
  const deadline = searchParams.get('deadline')

  const where: any = {}

  if (status) where.status = status
  if (department) where.department = department
  if (deadline) {
    where.deadline = {
      lte: new Date(deadline)
    }
  }

  try {
    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        deadline: true,
        assignedTo: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, department, assignedTo, deadline, attachments, createdAt, createdBy } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        department,
        assignedTo: { connect: { id: assignedTo } },
        deadline: new Date(deadline),
        attachments: attachments.join(','), // Convert array to comma-separated string
        createdAt: new Date(createdAt),
        createdBy: { connect: { id: createdBy } },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}
