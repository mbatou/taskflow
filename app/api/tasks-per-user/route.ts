import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: true,
      },
    });

    const tasksPerUser = tasks.reduce((acc, task) => {
      const userId = task.assignedTo.id;
      if (!acc[userId]) {
        acc[userId] = { user: task.assignedTo, tasks: [] };
      }
      acc[userId].tasks.push(task);
      return acc;
    }, {});

    return NextResponse.json(tasksPerUser);
  } catch (error) {
    console.error('Error fetching tasks per user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
