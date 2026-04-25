import { requireAdmin } from '@/lib/dal'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <AdminShell user={{ ...session.user, image: session.user.image ?? null, role: session.user.role ?? null }}>
      {children}
    </AdminShell>
  )
}
