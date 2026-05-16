import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { articles, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Check if database URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found')
      return getFallbackSitemap()
    }

    const [publishedArticles, activeCategories] = await Promise.all([
      db.select({ slug: articles.slug, updatedAt: articles.updatedAt, publishedAt: articles.publishedAt })
        .from(articles)
        .where(eq(articles.status, 'published')),
      db.select({ slug: categories.slug, updatedAt: categories.updatedAt })
        .from(categories)
        .where(eq(categories.isActive, true)),
    ])

    const staticRoutes: MetadataRoute.Sitemap = [
      { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    ]

    const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((cat) => ({
      url: `${siteUrl}/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'hourly',
      priority: 0.8,
    }))

    const articleRoutes: MetadataRoute.Sitemap = publishedArticles.map((a) => ({
      url: `${siteUrl}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    return [...staticRoutes, ...categoryRoutes, ...articleRoutes]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return getFallbackSitemap()
  }
}

function getFallbackSitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsedition.in'

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
  ]
}
