import { prisma } from '@/lib/prisma'

export async function sendNotification(userId: string, message: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        read: false,
      },
    });
    
    // Here you could also implement real-time notifications
    // using WebSockets or a service like Pusher
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
