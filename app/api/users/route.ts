import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const department = searchParams.get('department')

  try {
    let users;
    if (department) {
      users = await prisma.user.findMany({
        where: { department },
        select: { id: true, name: true },
      })
    } else {
      users = await prisma.user.findMany({
        select: { id: true, name: true },
      })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}
