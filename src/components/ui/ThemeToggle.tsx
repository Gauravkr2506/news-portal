'use client'
import { useTheme } from '@/components/layout/ThemeProvider'
import styles from './ThemeToggle.module.scss'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={cn(styles.toggle, isDark && styles.dark)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={cn(styles.thumb, isDark && styles.active)}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
