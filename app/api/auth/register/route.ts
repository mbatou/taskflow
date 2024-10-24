import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password, department } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}