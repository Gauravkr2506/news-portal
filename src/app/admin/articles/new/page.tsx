import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ArticleEditor } from '@/components/admin/ArticleEditor'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'New Article' }

export default async function NewArticlePage() {
  await requireAdmin()
  const cats = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>New Article</h1>
      </div>
      <ArticleEditor categories={cats} />
    </div>
  )
}
