import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const commentId = Number(id)
    if (isNaN(commentId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const { status } = await request.json()
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const [updated] = await db.update(comments)
      .set({ status, updatedAt: new Date() })
      .where(eq(comments.id, commentId))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const commentId = Number(id)
    if (isNaN(commentId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    await db.delete(comments).where(eq(comments.id, commentId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
