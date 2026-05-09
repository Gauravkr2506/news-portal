import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { homeSections, categories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/dal'
import { HomeSectionManager } from '@/components/admin/HomeSectionManager'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Homepage Layout' }

export default async function HomepagePage() {
  await requireAdmin()

  const [sections, allCategories] = await Promise.all([
    db
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
      .orderBy(asc(homeSections.sortOrder)),

    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name)),
  ])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Homepage Layout</h1>
          <p className={styles.subtitle}>
            Add category sections that appear below Latest News. Drag to reorder using the arrows.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.fixedSection}>
          <span className={styles.fixedLabel}>Fixed</span>
          <div className={styles.fixedInfo}>
            <div className={styles.fixedTitle}>Latest News</div>
            <div className={styles.fixedMeta}>Always shown — most recent 9 published articles</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Category Sections</h2>
        <p className={styles.cardDesc}>
          Each section shows the latest articles from a specific category, rendered below Latest News.
        </p>
        <HomeSectionManager initialSections={sections} categories={allCategories} />
      </div>
    </div>
  )
}
