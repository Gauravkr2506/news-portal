'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/auth-client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import styles from '../login/page.module.scss'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const result = await signUp.email({ name, email, password, callbackURL: '/' })
    if (result.error) {
      setError(result.error.message || 'Registration failed. Please try again.')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn.social({ provider: 'google', callbackURL: '/' })
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#16a34a', marginBottom: '8px' }}>Account created! ✅</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Redirecting you home...</p>
      </div>
    )
  }

  return (
    <>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.subtitle}>Join NewsEdition today</p>

      <button type="button" onClick={handleGoogle} className={styles.googleBtn} disabled={googleLoading} aria-label="Sign up with Google">
        {googleLoading ? <span className={styles.spinner} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        )}
        Continue with Google
      </button>

      <div className={styles.divider}><span>or register with email</span></div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input name="name" label="Full Name" placeholder="John Doe" autoComplete="name" required />
        <Input name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required />
        <Input name="password" type="password" label="Password" placeholder="Min. 8 characters" autoComplete="new-password" required hint="Must be at least 8 characters" />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  )
}
