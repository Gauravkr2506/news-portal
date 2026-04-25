import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { comments, articles } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { CommentsManager } from './CommentsManager'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Comments' }

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function CommentsPage({ searchParams }: Props) {
  await requireAdmin()
  const { status } = await searchParams

  const validStatus = status && ['pending', 'approved', 'rejected'].includes(status) ? status : undefined

  const rows = await db
    .select({
      id: comments.id,
      articleId: comments.articleId,
      userId: comments.userId,
      guestName: comments.guestName,
      guestEmail: comments.guestEmail,
      content: comments.content,
      status: comments.status,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      articleTitle: articles.title,
    })
    .from(comments)
    .leftJoin(articles, eq(comments.articleId, articles.id))
    .where(validStatus ? eq(comments.status, validStatus) : undefined)
    .orderBy(desc(comments.createdAt))
    .limit(50)

  const tabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Comments</h1>
      </div>

      <div className={styles.tabs}>
        {tabs.map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/admin/comments?status=${value}` : '/admin/comments'}
            className={`${styles.tab} ${(status === value || (!status && !value)) ? styles.activeTab : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <CommentsManager comments={rows as any} />
    </div>
  )
}
