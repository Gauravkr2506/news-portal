import Link from 'next/link'
import styles from './layout.module.scss'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>NewsEdition</Link>
        {children}
      </div>
    </div>
  )
}
