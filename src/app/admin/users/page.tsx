import type { Metadata } from 'next'
import { requireOwner } from '@/lib/dal'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { UsersManager } from './UsersManager'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Users' }

export default async function UsersPage() {
  const session = await requireOwner()
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>{allUsers.length} users</p>
      </div>
      <UsersManager users={allUsers} currentUserId={session.user.id} />
    </div>
  )
}
