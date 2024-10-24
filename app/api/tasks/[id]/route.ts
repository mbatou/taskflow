import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNotification } from '@/utils/notifications' // You'll need to create this utility

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
  const { id } = context.params;
  const body = await request.json()

  try {
    // Validate and transform the data before updating
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.department) updateData.department = body.department;
    if (body.taskType) updateData.taskType = body.taskType;
    if (body.status) updateData.status = body.status;
    if (body.deadline) {
      const date = new Date(body.deadline);
      if (!isNaN(date.getTime())) {
        updateData.deadline = date;
      }
    }
    
    let oldAssigneeId = null;
    if (body.assignedTo) {
      // Get the current assignee before updating
      const currentTask = await prisma.task.findUnique({
        where: { id },
        select: { assignedTo: { select: { id: true } } }
      });
      oldAssigneeId = currentTask?.assignedTo?.id;

      updateData.assignedTo = { connect: { id: body.assignedTo } };
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // If the assignee has changed, send a notification
    if (body.assignedTo && body.assignedTo !== oldAssigneeId) {
      await sendNotification(updatedTask.assignedTo.id, `You have been assigned a new task: ${updatedTask.title}`);
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
  }
}
