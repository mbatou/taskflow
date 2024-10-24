import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/utils/notifications"

export async function checkSLA() {
  const overdueTasks = await prisma.task.findMany({
    where: {
      status: { not: "Completed" },
      deadline: { lt: new Date() },
      slaBreached: false,
    },
    include: { assignedTo: true, createdBy: true },
  })

  for (const task of overdueTasks) {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: "Overdue", slaBreached: true },
    })

    // Send notifications
    if (task.assignedTo) {
      await sendNotification(task.assignedTo.id, `Task "${task.title}" is overdue`)
    }
    if (task.createdBy) {
      await sendNotification(task.createdBy.id, `Task "${task.title}" is overdue`)
    }
    // Send notification to department manager and admin
    const departmentManager = await prisma.user.findFirst({
      where: { department: task.department, role: "Department Manager" },
    })
    if (departmentManager) {
      await sendNotification(departmentManager.id, `Task "${task.title}" in your department is overdue`)
    }
    const admin = await prisma.user.findFirst({ where: { role: "Admin" } })
    if (admin) {
      await sendNotification(admin.id, `Task "${task.title}" is overdue`)
    }
  }
}

export async function getSLAMetrics() {
  const totalTasks = await prisma.task.count()
  const completedOnTimeTasks = await prisma.task.count({
    where: {
      status: "Completed",
      updatedAt: { lte: prisma.task.deadline },
    },
  })
  const overdueTasks = await prisma.task.count({ where: { status: "Overdue" } })

  return {
    totalTasks,
    completedOnTimePercentage: totalTasks > 0 ? (completedOnTimeTasks / totalTasks) * 100 : 0,
    overduePercentage: totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0,
  }
}
