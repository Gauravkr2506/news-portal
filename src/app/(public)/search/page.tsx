import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { articles, categories, users } from '@/lib/db/schema'
import { eq, and, desc, ilike, or } from 'drizzle-orm'
import { ArticleCard } from '@/components/news/ArticleCard'
import styles from './page.module.scss'
import type { ArticleWithRelations } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}"` : 'Search',
    robots: { index: false, follow: false },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, category } = await searchParams
  const query = q?.trim()

  const conditions = [eq(articles.status, 'published')]
  if (query) conditions.push(ilike(articles.title, `%${query}%`))
  if (category) {
    const cat = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, category)).limit(1)
    if (cat[0]) conditions.push(eq(articles.categoryId, cat[0].id))
  }

  const rows = query || category ? await db.select({
    id: articles.id, title: articles.title, slug: articles.slug,
    excerpt: articles.excerpt, coverImage: articles.coverImage,
    coverImageAlt: articles.coverImageAlt, coverImagePublicId: articles.coverImagePublicId,
    content: articles.content, status: articles.status, isFeatured: articles.isFeatured,
    isBreaking: articles.isBreaking, tags: articles.tags, seoTitle: articles.seoTitle,
    seoDescription: articles.seoDescription, viewCount: articles.viewCount,
    publishedAt: articles.publishedAt, createdAt: articles.createdAt, updatedAt: articles.updatedAt,
    categoryId: categories.id, categoryName: categories.name,
    categorySlug: categories.slug, categoryColor: categories.color,
    authorId: users.id, authorName: users.name, authorImage: users.image,
  })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt))
    .limit(48)
  : []

  const results: ArticleWithRelations[] = rows.map((r) => ({
    id: r.id, title: r.title, slug: r.slug, content: r.content,
    excerpt: r.excerpt, coverImage: r.coverImage, coverImageAlt: r.coverImageAlt,
    coverImagePublicId: r.coverImagePublicId, status: r.status as 'published',
    isFeatured: r.isFeatured, isBreaking: r.isBreaking, tags: r.tags,
    seoTitle: r.seoTitle, seoDescription: r.seoDescription, viewCount: r.viewCount,
    publishedAt: r.publishedAt, createdAt: r.createdAt, updatedAt: r.updatedAt,
    category: r.categoryId ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug!, color: r.categoryColor! } : null,
    author: r.authorId ? { id: r.authorId, name: r.authorName!, image: r.authorImage } : null,
  }))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && <p className={styles.count}>{results.length} article{results.length !== 1 ? 's' : ''} found</p>}
      </div>

      <form className={styles.searchForm} method="get">
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search articles…"
            className={styles.searchInput}
            autoFocus
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </div>
      </form>

      {!query && !category ? (
        <div className={styles.prompt}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p>Enter a keyword to search articles</p>
        </div>
      ) : results.length === 0 ? (
        <div className={styles.empty}>
          <p>No articles found{query ? ` for "${query}"` : ''}.</p>
          <p className={styles.emptyHint}>Try different keywords or browse by category.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {results.map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  )
}
