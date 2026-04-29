import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { bio, twitterUrl, facebookUrl, instagramUrl, linkedinUrl, websiteUrl } = body

  const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

  await db.update(users).set({
    bio: clean(bio),
    twitterUrl: clean(twitterUrl),
    facebookUrl: clean(facebookUrl),
    instagramUrl: clean(instagramUrl),
    linkedinUrl: clean(linkedinUrl),
    websiteUrl: clean(websiteUrl),
    updatedAt: new Date(),
  }).where(eq(users.id, session.user.id))

  return NextResponse.json({ success: true })
}
