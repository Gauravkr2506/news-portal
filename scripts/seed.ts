import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const DEFAULT_CATEGORIES = [
  { name: 'Politics', slug: 'politics', color: '#dc2626', icon: '🏛️', sortOrder: 1 },
  { name: 'Business', slug: 'business', color: '#d97706', icon: '💼', sortOrder: 2 },
  { name: 'Technology', slug: 'technology', color: '#2563eb', icon: '💻', sortOrder: 3 },
  { name: 'Sports', slug: 'sports', color: '#16a34a', icon: '⚽', sortOrder: 4 },
  { name: 'Entertainment', slug: 'entertainment', color: '#db2777', icon: '🎬', sortOrder: 5 },
  { name: 'Health', slug: 'health', color: '#0891b2', icon: '🏥', sortOrder: 6 },
  { name: 'Science', slug: 'science', color: '#7c3aed', icon: '🔬', sortOrder: 7 },
  { name: 'World', slug: 'world', color: '#475569', icon: '🌍', sortOrder: 8 },
  { name: 'Education', slug: 'education', color: '#059669', icon: '📚', sortOrder: 9 },
  { name: 'Weather', slug: 'weather', color: '#0284c7', icon: '🌤️', sortOrder: 10 },
]

async function seed() {
  console.log('🌱 Seeding database…')

  // Seed categories
  console.log('Creating categories…')
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug))
    if (existing.length === 0) {
      await db.insert(schema.categories).values({
        ...cat,
        description: `Latest ${cat.name.toLowerCase()} news and updates`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`  ✓ Created category: ${cat.name}`)
    } else {
      console.log(`  - Category exists: ${cat.name}`)
    }
  }

  // Check if owner already exists
  const ownerEmail = 'admin@newsedition.in'
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, ownerEmail))

  if (existing.length > 0) {
    // Make sure they have owner role
    await db.update(schema.users).set({ role: 'owner' }).where(eq(schema.users.email, ownerEmail))
    console.log(`✓ Owner user already exists (${ownerEmail}), ensured owner role`)
  } else {
    console.log(`\n⚠️  Owner user not found. Please register at /register with:`)
    console.log(`   Email: ${ownerEmail}`)
    console.log(`   Password: 12345678`)
    console.log(`\n   After registering, run this script again to set owner role.`)
  }

  console.log('\n✅ Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
