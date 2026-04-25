import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Page Not Found' }

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '6rem', fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '1rem 0 0.5rem' }}>Page Not Found</h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
          <Link
            href="/"
            style={{ padding: '0.625rem 1.5rem', background: '#dc2626', color: '#fff', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  )
}
