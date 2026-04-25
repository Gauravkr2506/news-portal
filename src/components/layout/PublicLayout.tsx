import { Header } from './Header'
import { Footer } from './Footer'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

async function getCategories() {
  return db.select({ name: categories.name, slug: categories.slug, color: categories.color })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder))
}

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cats = await getCategories()

  return (
    <>
      <Header categories={cats} />
      <main id="main-content">{children}</main>
      <Footer categories={cats} />
    </>
  )
}
