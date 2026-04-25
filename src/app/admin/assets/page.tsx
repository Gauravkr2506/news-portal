import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/dal'
import { db } from '@/lib/db'
import { assets } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { AssetsManager } from './AssetsManager'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Assets' }

export default async function AssetsPage() {
  await requireAdmin()
  const allAssets = await db.select().from(assets).orderBy(desc(assets.createdAt)).limit(200)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Assets</h1>
        <p className={styles.subtitle}>{allAssets.length} files</p>
      </div>
      <AssetsManager assets={allAssets} />
    </div>
  )
}
