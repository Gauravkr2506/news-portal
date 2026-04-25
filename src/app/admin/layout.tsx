import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/dal'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import styles from './layout.module.scss'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className={styles.layout}>
      <AdminSidebar user={{ ...session.user, image: session.user.image ?? null, role: session.user.role ?? null }} />
      <div className={styles.main}>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
