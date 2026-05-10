import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { isAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { homeSections } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function guard() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !isAdmin(session.user.role)) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const allowed = ['title', 'articleCount', 'sortOrder', 'isActive']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const [updated] = await db
    .update(homeSections)
    .set(update)
    .where(eq(homeSections.id, Number(id)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidatePath('/')
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await guard()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  await db.delete(homeSections).where(eq(homeSections.id, Number(id)))
  revalidatePath('/')
  return new NextResponse(null, { status: 204 })
}
