'use server'
import { db } from '@/lib/db'
import { comments } from '@/lib/db/schema'
import { getSession } from '@/lib/dal'

export async function submitComment(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const articleId = Number(formData.get('articleId'))
  const content = (formData.get('content') as string)?.trim()
  const guestName = (formData.get('guestName') as string)?.trim()
  const guestEmail = (formData.get('guestEmail') as string)?.trim()

  if (!content || content.length < 3) return { success: false, error: 'Comment is too short.' }
  if (content.length > 2000) return { success: false, error: 'Comment is too long (max 2000 chars).' }

  const session = await getSession()

  await db.insert(comments).values({
    articleId,
    userId: session?.user?.id ?? null,
    guestName: session ? null : (guestName || null),
    guestEmail: session ? null : (guestEmail || null),
    content,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return { success: true }
}
