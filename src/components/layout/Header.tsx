'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import styles from './Header.module.scss'
import type { Category } from '@/lib/db/schema'

interface HeaderProps {
  categories?: Pick<Category, 'name' | 'slug' | 'color'>[]
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

  const topCategories = categories.slice(0, 10)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
          {topCategories.slice(0, 6).map((cat) => (
            <Link key={cat.slug} href={`/${cat.slug}`}>{cat.name}</Link>
          ))}
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
                  {isAdmin && (
                    <Link href="/admin/dashboard" className={styles.dropdownItem} role="menuitem" onClick={() => setShowDropdown(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button
                    className={`${styles.dropdownItem} ${styles.danger}`}
                    role="menuitem"
                    onClick={() => { signOut(); setShowDropdown(false) }}
                  >
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

      {topCategories.length > 0 && (
        <div className={styles.categoryBar}>
          <div className={styles.categoryBarInner}>
            <Link href="/">All</Link>
            {topCategories.map((cat) => (
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
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/${cat.slug}`} onClick={() => setShowMobile(false)}>{cat.name}</Link>
          ))}
          <Link href="/search" onClick={() => setShowMobile(false)}>Search</Link>
          {!session && <Link href="/login" onClick={() => setShowMobile(false)}>Sign In</Link>}
        </div>
      )}
    </header>
  )
}
