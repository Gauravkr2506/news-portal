import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { articles, categories, comments, assets, users } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/dal'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 60

async function getStats() {
  const [
    [{ totalArticles }],
    [{ publishedArticles }],
    [{ draftArticles }],
    [{ totalCategories }],
    [{ totalComments }],
    [{ pendingComments }],
    [{ totalAssets }],
    [{ totalUsers }],
  ] = await Promise.all([
    db.select({ totalArticles: count() }).from(articles),
    db.select({ publishedArticles: count() }).from(articles).where(eq(articles.status, 'published')),
    db.select({ draftArticles: count() }).from(articles).where(eq(articles.status, 'draft')),
    db.select({ totalCategories: count() }).from(categories),
    db.select({ totalComments: count() }).from(comments),
    db.select({ pendingComments: count() }).from(comments).where(eq(comments.status, 'pending')),
    db.select({ totalAssets: count() }).from(assets),
    db.select({ totalUsers: count() }).from(users),
  ])
  return { totalArticles, publishedArticles, draftArticles, totalCategories, totalComments, pendingComments, totalAssets, totalUsers }
}

async function getRecentArticles() {
  return db.select({ id: articles.id, title: articles.title, slug: articles.slug, status: articles.status, createdAt: articles.createdAt })
    .from(articles)
    .orderBy(sql`${articles.createdAt} desc`)
    .limit(5)
}

async function getRecentComments() {
  return db.select({ id: comments.id, content: comments.content, status: comments.status, guestName: comments.guestName, createdAt: comments.createdAt })
    .from(comments)
    .orderBy(sql`${comments.createdAt} desc`)
    .limit(5)
}

export default async function DashboardPage() {
  await requireAdmin()
  const [stats, recentArticles, recentComments] = await Promise.all([getStats(), getRecentArticles(), getRecentComments()])

  const statCards = [
    { label: 'Total Articles', value: stats.totalArticles, href: '/admin/articles', color: '#2563eb' },
    { label: 'Published', value: stats.publishedArticles, href: '/admin/articles?status=published', color: '#16a34a' },
    { label: 'Drafts', value: stats.draftArticles, href: '/admin/articles?status=draft', color: '#d97706' },
    { label: 'Categories', value: stats.totalCategories, href: '/admin/categories', color: '#7c3aed' },
    { label: 'Comments', value: stats.totalComments, href: '/admin/comments', color: '#0891b2' },
    { label: 'Pending Review', value: stats.pendingComments, href: '/admin/comments?status=pending', color: '#dc2626' },
    { label: 'Assets', value: stats.totalAssets, href: '/admin/assets', color: '#059669' },
    { label: 'Users', value: stats.totalUsers, href: '/admin/users', color: '#0f172a' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link href="/admin/articles/new" className={styles.newBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Article
        </Link>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: card.color }}>{card.value.toLocaleString()}</div>
            <div className={styles.statLabel}>{card.label}</div>
          </Link>
        ))}
      </div>

      <div className={styles.columns}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Articles</h2>
            <Link href="/admin/articles" className={styles.sectionLink}>View all</Link>
          </div>
          <div className={styles.list}>
            {recentArticles.map((a) => (
              <div key={a.id} className={styles.listItem}>
                <div className={styles.listItemMain}>
                  <Link href={`/admin/articles/${a.id}/edit`} className={styles.listItemTitle}>{a.title}</Link>
                  <span className={`${styles.badge} ${styles[a.status as string]}`}>{a.status}</span>
                </div>
                <div className={styles.listItemDate}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            ))}
            {recentArticles.length === 0 && <p className={styles.empty}>No articles yet.</p>}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Comments</h2>
            <Link href="/admin/comments" className={styles.sectionLink}>View all</Link>
          </div>
          <div className={styles.list}>
            {recentComments.map((c) => (
              <div key={c.id} className={styles.listItem}>
                <div className={styles.listItemMain}>
                  <p className={styles.commentText}>{c.content.slice(0, 80)}{c.content.length > 80 ? '…' : ''}</p>
                  <span className={`${styles.badge} ${styles[c.status as string]}`}>{c.status}</span>
                </div>
                <div className={styles.listItemDate}>{c.guestName || 'User'}</div>
              </div>
            ))}
            {recentComments.length === 0 && <p className={styles.empty}>No comments yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
