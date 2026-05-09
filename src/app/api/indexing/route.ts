import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { articles, categories } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const ALLOWED_EMAIL = 'newsedition1@gmail.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const clientId = process.env.GOOGLE_INDEXING_CLIENT_ID
  const clientSecret = process.env.GOOGLE_INDEXING_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_INDEXING_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ error: 'Google Indexing API not configured' }, { status: 500 })
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const indexing = google.indexing({ version: 'v3', auth: oauth2Client })

  const [publishedArticles, activeCategories] = await Promise.all([
    db
      .select({ slug: articles.slug })
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.createdAt))
      .limit(180),
    db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.isActive, true)),
  ])

  const urls = [
    SITE_URL,
    ...publishedArticles.map(a => `${SITE_URL}/article/${a.slug}`),
    ...activeCategories.map(c => `${SITE_URL}/${c.slug}`),
  ]

  const results = await Promise.allSettled(
    urls.map(url =>
      indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      })
    )
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ submitted: urls.length, succeeded, failed })
}
