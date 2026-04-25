import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/dal'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireOwner()
    const { id } = await params
    if (id === session.user.id) return NextResponse.json({ error: 'Cannot modify your own account here' }, { status: 400 })

    const body = await request.json()
    const { role, banned, banReason } = body

    const validRoles = ['user', 'admin', 'owner']
    if (role !== undefined && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const [updated] = await db.update(users).set({
      ...(role !== undefined ? { role } : {}),
      ...(banned !== undefined ? { banned: Boolean(banned) } : {}),
      ...(banReason !== undefined ? { banReason: banReason || null } : {}),
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning()

    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ id: updated.id, role: updated.role, banned: updated.banned })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
