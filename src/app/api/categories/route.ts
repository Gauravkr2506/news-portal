import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { name, description, color, icon, isActive, sortOrder } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const slug = slugify(name)
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug))
    if (existing.length > 0) return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 })

    const now = new Date()
    const [category] = await db.insert(categories).values({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      color: color || '#3b82f6',
      icon: icon?.trim() || null,
      isActive: isActive !== false,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return NextResponse.json(category)
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
