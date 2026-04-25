'use client'
import { useState } from 'react'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import styles from '@/app/admin/layout.module.scss'
import type { User } from '@/lib/db/schema'

interface AdminShellProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'>
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <AdminSidebar user={user} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <div className={styles.main}>
        <div className={styles.mobileHeader}>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className={styles.mobileLogo}>NewsEdition Admin</span>
        </div>

        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
