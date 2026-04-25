'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyEmail } from '@/lib/auth-client'
import styles from '../login/page.module.scss'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }

    verifyEmail({ query: { token } })
      .then((result) => {
        if (result.error) {
          setStatus('error')
          setMessage(result.error.message || 'Verification failed. The link may have expired.')
        } else {
          setStatus('success')
          setTimeout(() => router.push('/'), 2500)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token, router])

  return (
    <>
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <span className={styles.spinner} style={{ display: 'inline-block' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '14px' }}>Verifying your email…</p>
        </div>
      )}
      {status === 'success' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ fontWeight: 600, color: '#16a34a', marginBottom: '0.25rem' }}>Email verified!</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirecting you home…</p>
        </div>
      )}
      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
          <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: '0.5rem' }}>Verification failed</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '1.5rem' }}>{message}</p>
          <Link href="/login" style={{ padding: '0.5rem 1.5rem', background: '#dc2626', color: '#fff', borderRadius: '9999px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      )}
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <>
      <h1 className={styles.title}>Email Verification</h1>
      <Suspense fallback={
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading…
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </>
  )
}
