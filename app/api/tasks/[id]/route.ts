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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Prepare the update data
    const updateData: any = {};

    // Handle status update
    if (body.status) {
      updateData.status = body.status;
    }

    // Handle assignedTo update
    if (body.assignedTo) {
      updateData.assignedTo = {
        connect: { id: body.assignedTo.id }
      };
    }

    // Handle other field updates
    const updatableFields = ['title', 'description', 'priority', 'dueDate'];
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle dynamicFields update
    if (body.dynamicFields) {
      updateData.dynamicFields = JSON.stringify(body.dynamicFields);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If status was updated, you might want to send a notification
    if (body.status && updatedTask.assignedTo) {
      await sendNotification(updatedTask.assignedTo.email, `Task status updated to ${updatedTask.status}`);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Error updating task" }, { status: 500 });
  }
}
