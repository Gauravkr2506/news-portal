import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { CategoryManager } from './CategoryManager'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  await requireAdmin()
  const cats = await db.select().from(categories).orderBy(categories.sortOrder)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categories</h1>
        <p className={styles.subtitle}>{cats.length} categories</p>
      </div>
      <CategoryManager categories={cats} />
    </div>
  )
}
