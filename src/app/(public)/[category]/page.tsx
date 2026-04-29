import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { articles, categories, users } from '@/lib/db/schema'
import { eq, and, desc, inArray, or } from 'drizzle-orm'
import { ArticleCard } from '@/components/news/ArticleCard'
import styles from './page.module.scss'
import type { ArticleWithRelations } from '@/types'

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 12

async function getCategory(slug: string) {
  const rows = await db.select().from(categories).where(and(eq(categories.slug, slug), eq(categories.isActive, true))).limit(1)
  return rows[0] ?? null
}

async function getSubcategories(parentId: number) {
  return db.select().from(categories).where(and(eq(categories.parentId, parentId), eq(categories.isActive, true))).orderBy(categories.sortOrder)
}

async function getParentCategory(parentId: number) {
  const rows = await db.select().from(categories).where(eq(categories.id, parentId)).limit(1)
  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params
  const cat = await getCategory(slug)
  if (!cat) return { title: 'Category Not Found' }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'
  return {
    title: `${cat.name} News`,
    description: cat.description || `Latest ${cat.name} news and updates from NewsEdition.`,
    alternates: { canonical: `${siteUrl}/${slug}` },
  }
}

export async function generateStaticParams() {
  const cats = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true))
  return cats.map((c) => ({ category: c.slug }))
}

export const revalidate = 300

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const cat = await getCategory(slug)
  if (!cat) notFound()

  // Fetch parent + subcategories for context
  const [subcategories, parentCat] = await Promise.all([
    cat.parentId ? [] : getSubcategories(cat.id),
    cat.parentId ? getParentCategory(cat.parentId) : null,
  ])

  // Include articles from subcategories when viewing a parent category
  const categoryIds = cat.parentId ? [cat.id] : [cat.id, ...subcategories.map((s) => s.id)]
  const categoryCondition = categoryIds.length > 1
    ? inArray(articles.categoryId, categoryIds)
    : eq(articles.categoryId, cat.id)

  const rows = await db.select({
    id: articles.id, title: articles.title, slug: articles.slug,
    excerpt: articles.excerpt, coverImage: articles.coverImage,
    coverImageAlt: articles.coverImageAlt, coverImagePublicId: articles.coverImagePublicId,
    content: articles.content, status: articles.status, isFeatured: articles.isFeatured,
    isBreaking: articles.isBreaking, tags: articles.tags,
    seoTitle: articles.seoTitle, seoDescription: articles.seoDescription,
    viewCount: articles.viewCount, publishedAt: articles.publishedAt,
    createdAt: articles.createdAt, updatedAt: articles.updatedAt,
    categoryId: categories.id, categoryName: categories.name,
    categorySlug: categories.slug, categoryColor: categories.color,
    authorId: users.id, authorName: users.name, authorImage: users.image,
  })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(and(eq(articles.status, 'published'), categoryCondition))
    .orderBy(desc(articles.publishedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)

  const articlesList: ArticleWithRelations[] = rows.map((r) => ({
    id: r.id, title: r.title, slug: r.slug, content: r.content,
    excerpt: r.excerpt, coverImage: r.coverImage, coverImageAlt: r.coverImageAlt,
    coverImagePublicId: r.coverImagePublicId, status: r.status as 'published',
    isFeatured: r.isFeatured, isBreaking: r.isBreaking, tags: r.tags,
    seoTitle: r.seoTitle, seoDescription: r.seoDescription, viewCount: r.viewCount,
    publishedAt: r.publishedAt, createdAt: r.createdAt, updatedAt: r.updatedAt,
    category: r.categoryId ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug!, color: r.categoryColor! } : null,
    author: r.authorId ? { id: r.authorId, name: r.authorName!, image: r.authorImage } : null,
  }))

  const hasMore = rows.length === PAGE_SIZE

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'
  const catUrl = `${siteUrl}/${slug}`

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    ...(parentCat ? [{ '@type': 'ListItem', position: 2, name: parentCat.name, item: `${siteUrl}/${parentCat.slug}` }] : []),
    { '@type': 'ListItem', position: parentCat ? 3 : 2, name: cat.name, item: catUrl },
  ]

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cat.name} News`,
    description: cat.description || `Latest ${cat.name} news and updates from NewsEdition.`,
    url: catUrl,
    inLanguage: 'en',
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumbItems },
    ...(articlesList.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: articlesList.slice(0, 10).map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${siteUrl}/article/${a.slug}`,
          name: a.title,
        })),
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    <div className={styles.page}>
      <div className={styles.header}>
        {parentCat && (
          <div className={styles.breadcrumb}>
            <Link href={`/${parentCat.slug}`} className={styles.breadcrumbLink}>
              <div className={styles.dot} style={{ background: parentCat.color ?? undefined }} />
              {parentCat.name}
            </Link>
            <span className={styles.breadcrumbSep}>›</span>
          </div>
        )}
        <div className={styles.titleRow}>
          <div className={styles.dot} style={{ background: cat.color ?? undefined }} />
          <h1 className={styles.title}>{cat.name}</h1>
        </div>
        {cat.description && <p className={styles.description}>{cat.description}</p>}
      </div>

      {subcategories.length > 0 && (
        <div className={styles.subFilter}>
          <Link href={`/${slug}`} className={styles.subFilterLink}>All</Link>
          {subcategories.map((sub) => (
            <Link key={sub.slug} href={`/${sub.slug}`} className={styles.subFilterLink}
              style={{ borderColor: sub.color || '#ccc' }}>
              {sub.icon && <span>{sub.icon}</span>}
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {articlesList.length > 0 ? (
        <>
          <div className={styles.grid}>
            {articlesList.map((a, i) => (
              <ArticleCard key={a.id} article={a} priority={i < 3} />
            ))}
          </div>
          <div className={styles.pagination}>
            {page > 1 && (
              <Link href={`/${slug}?page=${page - 1}`} className={styles.pageBtn}>← Previous</Link>
            )}
            <span className={styles.pageInfo}>Page {page}</span>
            {hasMore && (
              <Link href={`/${slug}?page=${page + 1}`} className={styles.pageBtn}>Next →</Link>
            )}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <p>No articles in this category yet. Check back soon!</p>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </div>
      )}
    </div>
    </>
  )
}
