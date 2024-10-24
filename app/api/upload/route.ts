import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = file.name
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filepath = path.join(uploadDir, filename)

  try {
    await writeFile(filepath, buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
