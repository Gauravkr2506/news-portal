'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { slugify } from '@/lib/utils'
import styles from './Header.module.scss'
import type { Category } from '@/lib/db/schema'

interface HeaderProps {
  categories?: Pick<Category, 'id' | 'name' | 'slug' | 'color' | 'parentId'>[]
}

export function Header({ categories = [] }: HeaderProps) {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobile, setShowMobile] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const topLevel = categories.filter((c) => !c.parentId).slice(0, 10)
  const subsByParent = categories.reduce<Record<number, typeof categories>>((acc, c) => {
    if (c.parentId) { acc[c.parentId] = [...(acc[c.parentId] || []), c] }
    return acc
  }, {})
  const [today, setToday] = useState('')
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])
  const userRole = session?.user?.role
  const isAdmin = userRole === 'admin' || userRole === 'owner'
  const initial = session?.user?.name?.charAt(0).toUpperCase()

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <span className={styles.date}>{today}</span>
          <nav className={styles.topLinks} aria-label="Secondary navigation">
            <Link href="/search">Search</Link>
            {isAdmin && <Link href="/admin/dashboard">Admin</Link>}
          </nav>
        </div>
      </div>

      <nav className={styles.mainNav} aria-label="Main navigation">
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>NewsEdition</span>
          <span className={styles.logoTagline}>Your trusted source</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          {topLevel.slice(0, 6).map((cat) => {
            const subs = subsByParent[cat.id] || []
            return subs.length > 0 ? (
              <div key={cat.slug} className={styles.navItem}>
                <Link href={`/${cat.slug}`} className={styles.navLink}>
                  {cat.name}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                </Link>
                <div className={styles.subMenu}>
                  {subs.map((sub) => (
                    <Link key={sub.slug} href={`/${sub.slug}`} className={styles.subLink}>{sub.name}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={cat.slug} href={`/${cat.slug}`}>{cat.name}</Link>
            )
          })}
        </div>

        <div className={styles.actions}>
          <Link href="/search" className={styles.searchBtn} aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </Link>

          <ThemeToggle />

          {session ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userAvatar}
                onClick={() => setShowDropdown((v) => !v)}
                aria-label="User menu"
                aria-expanded={showDropdown}
              >
                {session.user.image ? (
                  <Image src={session.user.image} alt={session.user.name} width={36} height={36} />
                ) : initial}
              </button>
              {showDropdown && (
                <div className={styles.dropdown} role="menu">
                  <div style={{ padding: '8px 12px 4px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {session.user.name}
                  </div>
                  <hr className={styles.divider} />
                  <Link
                    href={`/author/${session.user.id}/${slugify(session.user.name)}`}
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    My Profile
                  </Link>
                  <Link
                    href="/settings/profile"
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className={styles.dropdownItem} role="menuitem" onClick={() => setShowDropdown(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                      Admin Panel
                    </Link>
                  )}
                  <hr className={styles.divider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.danger}`}
                    role="menuitem"
                    onClick={() => { signOut(); setShowDropdown(false) }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.authLink}>Sign In</Link>
          )}

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setShowMobile(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {topLevel.length > 0 && (
        <div className={styles.categoryBar}>
          <div className={styles.categoryBarInner}>
            <Link href="/">All</Link>
            {topLevel.map((cat) => (
              <Link key={cat.slug} href={`/${cat.slug}`}>{cat.name}</Link>
            ))}
          </div>
        </div>
      )}

      {showMobile && (
        <div className={styles.mobileMenu} role="dialog" aria-label="Navigation menu">
          <div className={styles.mobileClose}>
            <Link href="/" className={styles.logo} onClick={() => setShowMobile(false)}>
              <span className={styles.logoText}>NewsEdition</span>
            </Link>
            <button onClick={() => setShowMobile(false)} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <Link href="/" onClick={() => setShowMobile(false)}>Home</Link>
          {topLevel.map((cat) => (
            <div key={cat.slug}>
              <Link href={`/${cat.slug}`} onClick={() => setShowMobile(false)}>{cat.name}</Link>
              {(subsByParent[cat.id] || []).map((sub) => (
                <Link key={sub.slug} href={`/${sub.slug}`} onClick={() => setShowMobile(false)} className={styles.mobileSub}>
                  — {sub.name}
                </Link>
              ))}
            </div>
          ))}
          <Link href="/search" onClick={() => setShowMobile(false)}>Search</Link>
          {!session && <Link href="/login" onClick={() => setShowMobile(false)}>Sign In</Link>}
        </div>
      )}
    </header>
  )
}
