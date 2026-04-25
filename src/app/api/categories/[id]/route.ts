import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const catId = Number(id)
    if (isNaN(catId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const [existing] = await db.select().from(categories).where(eq(categories.id, catId))
    if (!existing) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

    const body = await request.json()
    const { name, description, color, icon, isActive, sortOrder, parentId } = body

    // Prevent making a parent into its own child or circular references
    const resolvedParentId = 'parentId' in body
      ? (parentId ? Number(parentId) : null)
      : existing.parentId

    const [updated] = await db.update(categories).set({
      name: name?.trim() ?? existing.name,
      slug: name?.trim() ? slugify(name) : existing.slug,
      description: description?.trim() || null,
      color: color || existing.color,
      icon: icon?.trim() || null,
      parentId: resolvedParentId === catId ? existing.parentId : resolvedParentId,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
      updatedAt: new Date(),
    }).where(eq(categories.id, catId)).returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const catId = Number(id)
    if (isNaN(catId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    // Promote subcategories to top-level before deleting parent
    await db.update(categories).set({ parentId: null }).where(eq(categories.parentId, catId))
    await db.delete(categories).where(eq(categories.id, catId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
