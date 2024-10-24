import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const department = searchParams.get('department')
  const taskType = searchParams.get('taskType')
  const deadline = searchParams.get('deadline')

  const where: any = {}

  if (status) where.status = status
  if (department) where.department = department
  if (taskType) where.taskType = taskType
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
        description: true,
        department: true,
        taskType: true,
        status: true,
        deadline: true,
        assignedTo: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        dynamicFields: true,
      },
    })

    return NextResponse.json(tasks.map(task => ({
      ...task,
      dynamicFields: task.dynamicFields ? JSON.parse(task.dynamicFields as string) : {},
    })))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, department, taskType, assignedTo, deadline, attachments, createdAt, createdBy, ...dynamicFields } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        department,
        taskType,
        assignedTo: { connect: { id: assignedTo } },
        deadline: new Date(deadline),
        attachments: attachments.join(','),
        createdAt: new Date(createdAt),
        createdBy: { connect: { id: createdBy } },
        dynamicFields: JSON.stringify(dynamicFields),
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await prisma.task.delete({
      where: { id }, // Ensure id is used as a string
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status, deadline, assignedTo } = body

    if (!assignedTo) {
      return NextResponse.json({ error: 'Assignee ID is required' }, { status: 400 })
    }

    const updatedTask = await prisma.task.update({
      where: { id: String(id) },
      data: {
        status,
        deadline: new Date(deadline),
        assignedTo: {
          connect: { id: assignedTo }, // Ensure this is a valid user ID
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
