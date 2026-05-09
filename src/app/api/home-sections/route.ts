import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { isAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { homeSections, categories } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'

export async function GET() {
  const rows = await db
    .select({
      id: homeSections.id,
      title: homeSections.title,
      articleCount: homeSections.articleCount,
      sortOrder: homeSections.sortOrder,
      isActive: homeSections.isActive,
      categoryId: homeSections.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
    })
    .from(homeSections)
    .leftJoin(categories, eq(homeSections.categoryId, categories.id))
    .orderBy(asc(homeSections.sortOrder))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { categoryId, title, articleCount } = body

  if (!categoryId || !title) {
    return NextResponse.json({ error: 'categoryId and title are required' }, { status: 400 })
  }

  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${homeSections.sortOrder}), -1)` })
    .from(homeSections)

  const [section] = await db
    .insert(homeSections)
    .values({
      categoryId: Number(categoryId),
      title: String(title),
      articleCount: Number(articleCount) || 3,
      sortOrder: maxOrder + 1,
      isActive: true,
    })
    .returning()

  const [withCategory] = await db
    .select({
      id: homeSections.id,
      title: homeSections.title,
      articleCount: homeSections.articleCount,
      sortOrder: homeSections.sortOrder,
      isActive: homeSections.isActive,
      categoryId: homeSections.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.color,
    })
    .from(homeSections)
    .leftJoin(categories, eq(homeSections.categoryId, categories.id))
    .where(eq(homeSections.id, section.id))

  return NextResponse.json(withCategory, { status: 201 })
}
