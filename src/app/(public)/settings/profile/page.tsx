import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ProfileEditForm } from './ProfileEditForm'
import styles from './page.module.scss'

export const metadata = { title: 'Edit Profile — NewsEdition' }

export default async function EditProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const [user] = await db.select({
    id: users.id, name: users.name, image: users.image, role: users.role,
    bio: users.bio, twitterUrl: users.twitterUrl, facebookUrl: users.facebookUrl,
    instagramUrl: users.instagramUrl, linkedinUrl: users.linkedinUrl, websiteUrl: users.websiteUrl,
  }).from(users).where(eq(users.id, session.user.id)).limit(1)

  if (!user) redirect('/login')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit Profile</h1>
      <ProfileEditForm author={user} />
    </div>
  )
}
