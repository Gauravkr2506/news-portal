import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { db } from '@/lib/db'
import { assets } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'newsedition/articles'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await uploadToCloudinary(dataUri, folder, {
      public_id: `${Date.now()}-${file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    })

    await db.insert(assets).values({
      name: file.name,
      url: result.secure_url,
      publicId: result.public_id,
      type: 'image',
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      uploadedBy: session.user.id,
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
