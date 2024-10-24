import { NextResponse } from 'next/server'
import { sendEmail } from '@/utils/email'

export async function POST(request: Request) {
  try {
    const { name, email, department } = await request.json()

    // Send email invitation
    await sendEmail(email, `Invitation to join ${department}`, `Hello ${name},\n\nYou have been invited to join the ${department} department.`)

    return NextResponse.json({ message: 'Invitation email sent successfully' })
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return NextResponse.json({ error: 'Error sending invitation email' }, { status: 500 })
  }
}
