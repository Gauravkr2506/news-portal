import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { assets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const assetId = Number(id)
    if (isNaN(assetId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const [asset] = await db.select().from(assets).where(eq(assets.id, assetId))
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    await deleteFromCloudinary(asset.publicId).catch(() => {})
    await db.delete(assets).where(eq(assets.id, assetId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete asset error:', error)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
