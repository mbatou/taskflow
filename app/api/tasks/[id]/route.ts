import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Await params here

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...task,
      dynamicFields: task.dynamicFields ? JSON.parse(task.dynamicFields) : {},
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Error fetching task' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = context.params; // Await params here

  try {
    const body = await request.json()
    const { title, description, status, assignedTo, deadline, dynamicFields } = body

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        assignedTo: assignedTo ? { connect: { id: assignedTo.id } } : undefined,
        deadline: new Date(deadline),
        dynamicFields: JSON.stringify(dynamicFields),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({
      ...updatedTask,
      dynamicFields: updatedTask.dynamicFields ? JSON.parse(updatedTask.dynamicFields) : {},
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
  }
}
