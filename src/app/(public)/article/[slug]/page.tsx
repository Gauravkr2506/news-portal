import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { articles, categories, users, comments } from '@/lib/db/schema'
import { eq, and, desc, ne } from 'drizzle-orm'
import { ShareButtons } from '@/components/news/ShareButtons'
import { ArticleCard } from '@/components/news/ArticleCard'
import { formatDate } from '@/lib/utils'
import styles from './page.module.scss'
import type { ArticleWithRelations } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  const rows = await db.select({
    id: articles.id, title: articles.title, slug: articles.slug,
    content: articles.content, excerpt: articles.excerpt,
    coverImage: articles.coverImage, coverImageAlt: articles.coverImageAlt,
    coverImagePublicId: articles.coverImagePublicId,
    status: articles.status, isFeatured: articles.isFeatured,
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
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .limit(1)

  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const row = await getArticle(slug)
  if (!row) return { title: 'Article Not Found' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'
  const url = `${siteUrl}/article/${slug}`
  const title = row.seoTitle || row.title
  const description = row.seoDescription || row.excerpt || ''

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: row.coverImage ? [{ url: row.coverImage, width: 1200, height: 630, alt: row.coverImageAlt || title }] : [],
      publishedTime: row.publishedAt?.toISOString(),
      modifiedTime: row.updatedAt?.toISOString(),
      authors: row.authorName ? [row.authorName] : [],
      section: row.categoryName || undefined,
      tags: row.tags || undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export async function generateStaticParams() {
  const rows = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.status, 'published'))
  return rows.map((r) => ({ slug: r.slug }))
}

export const revalidate = 3600

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const row = await getArticle(slug)
  if (!row) notFound()

  const article: ArticleWithRelations = {
    id: row.id, title: row.title, slug: row.slug, content: row.content,
    excerpt: row.excerpt, coverImage: row.coverImage, coverImageAlt: row.coverImageAlt,
    coverImagePublicId: row.coverImagePublicId, status: row.status as 'published',
    isFeatured: row.isFeatured, isBreaking: row.isBreaking, tags: row.tags,
    seoTitle: row.seoTitle, seoDescription: row.seoDescription,
    viewCount: row.viewCount, publishedAt: row.publishedAt,
    createdAt: row.createdAt, updatedAt: row.updatedAt,
    category: row.categoryId ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug!, color: row.categoryColor! } : null,
    author: row.authorId ? { id: row.authorId, name: row.authorName!, image: row.authorImage } : null,
  }

  // Fetch related articles & approved comments in parallel
  const [related, approvedComments] = await Promise.all([
    db.select({
      id: articles.id, title: articles.title, slug: articles.slug,
      excerpt: articles.excerpt, coverImage: articles.coverImage,
      coverImageAlt: articles.coverImageAlt, coverImagePublicId: articles.coverImagePublicId,
      content: articles.content, status: articles.status, isFeatured: articles.isFeatured,
      isBreaking: articles.isBreaking, tags: articles.tags, seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription, viewCount: articles.viewCount,
      publishedAt: articles.publishedAt, createdAt: articles.createdAt, updatedAt: articles.updatedAt,
      categoryId: categories.id, categoryName: categories.name, categorySlug: categories.slug, categoryColor: categories.color,
      authorId: users.id, authorName: users.name, authorImage: users.image,
    })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(and(
        eq(articles.status, 'published'),
        ne(articles.slug, slug),
        row.categoryId ? eq(articles.categoryId, row.categoryId) : undefined,
      ))
      .orderBy(desc(articles.publishedAt))
      .limit(3),

    db.select({
      id: comments.id, content: comments.content, createdAt: comments.createdAt,
      guestName: comments.guestName, userId: comments.userId,
      userName: users.name, userImage: users.image,
    })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.articleId, row.id), eq(comments.status, 'approved')))
      .orderBy(desc(comments.createdAt))
      .limit(50),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'
  const articleUrl = `${siteUrl}/article/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: article.author ? [{ '@type': 'Person', name: article.author.name }] : [],
    publisher: {
      '@type': 'Organization',
      name: 'NewsEdition',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    keywords: article.tags?.join(', '),
    articleSection: article.category?.name,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.page}>
        <article className={styles.article}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {article.category && (
              <>
                <span aria-hidden="true">›</span>
                <Link href={`/${article.category.slug}`}>{article.category.name}</Link>
              </>
            )}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{article.title}</span>
          </nav>

          {/* Meta */}
          <div className={styles.meta}>
            {article.category && (
              <Link href={`/${article.category.slug}`} className={styles.category} style={{ background: article.category.color }}>
                {article.category.name}
              </Link>
            )}
            {article.isBreaking && <span className={styles.breaking}>Breaking</span>}
          </div>

          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}

          <div className={styles.byline}>
            {article.author && (
              <div className={styles.author}>
                <div className={styles.authorAvatar}>
                  {article.author.image ? (
                    <Image src={article.author.image} alt={article.author.name} width={40} height={40} />
                  ) : article.author.name.charAt(0)}
                </div>
                <div>
                  <span className={styles.authorName}>{article.author.name}</span>
                  {article.publishedAt && (
                    <time className={styles.date} dateTime={article.publishedAt.toISOString()}>
                      {formatDate(article.publishedAt, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  )}
                </div>
              </div>
            )}
            <ShareButtons title={article.title} url={articleUrl} />
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <figure className={styles.coverImage}>
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                width={1200}
                height={630}
                priority
                className={styles.img}
              />
              {article.coverImageAlt && <figcaption>{article.coverImageAlt}</figcaption>}
            </figure>
          )}

          {/* Content */}
          <div
            className={`article-content ${styles.content}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              <span className={styles.tagsLabel}>Tags:</span>
              {article.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className={styles.tag}>{tag}</Link>
              ))}
            </div>
          )}

          <div className={styles.shareBottom}>
            <ShareButtons title={article.title} url={articleUrl} />
          </div>
        </article>

        <aside className={styles.sidebar} aria-label="Article sidebar">
          {related.length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Related Stories</h3>
              <div className={styles.relatedList}>
                {related.map((r) => (
                  <ArticleCard key={r.id} article={{
                    ...r,
                    status: r.status as 'published',
                    category: r.categoryId ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug!, color: r.categoryColor! } : null,
                    author: r.authorId ? { id: r.authorId, name: r.authorName!, image: r.authorImage } : null,
                  }} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Comments */}
      <section className={styles.commentsSection} aria-label="Comments">
        <div className={styles.commentsInner}>
          <h2 className={styles.commentsTitle}>
            Comments ({approvedComments.length})
          </h2>
          <CommentForm articleId={article.id} />
          <div className={styles.commentsList}>
            {approvedComments.map((c) => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  {c.userImage ? (
                    <Image src={c.userImage} alt={c.userName || ''} width={36} height={36} />
                  ) : (c.userName || c.guestName || 'A').charAt(0).toUpperCase()}
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentAuthor}>{c.userName || c.guestName || 'Anonymous'}</span>
                    <time className={styles.commentDate}>{formatDate(c.createdAt)}</time>
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                </div>
              </div>
            ))}
            {approvedComments.length === 0 && (
              <p className={styles.noComments}>Be the first to comment!</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

// Inline comment form (client component)
import { CommentFormInline as CommentForm } from './CommentForm'
