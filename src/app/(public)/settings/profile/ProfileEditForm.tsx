'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { slugify } from '@/lib/utils'
import styles from './page.module.scss'

interface Author {
  id: string
  name: string
  image: string | null
  role: string | null
  bio: string | null
  twitterUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  websiteUrl: string | null
}

export function ProfileEditForm({ author }: { author: Author }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    bio: author.bio ?? '',
    twitterUrl: author.twitterUrl ?? '',
    facebookUrl: author.facebookUrl ?? '',
    instagramUrl: author.instagramUrl ?? '',
    linkedinUrl: author.linkedinUrl ?? '',
    websiteUrl: author.websiteUrl ?? '',
  })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      router.refresh()
      setTimeout(() => {
        router.push(`/author/${author.id}/${slugify(author.name)}`)
      }, 1000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const initial = author.name.charAt(0).toUpperCase()

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>
          {author.image ? (
            <Image src={author.image} alt={author.name} width={80} height={80} />
          ) : <span>{initial}</span>}
        </div>
        <div>
          <div className={styles.authorName}>{author.name}</div>
          <div className={styles.authorRole}>
            {author.role === 'owner' ? 'Editor-in-Chief' : author.role === 'admin' ? 'Editor' : 'Contributor'}
          </div>
          <p className={styles.avatarNote}>Profile photo is set via Google account or contact an admin.</p>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Bio</label>
        <textarea
          className={styles.textarea}
          value={form.bio}
          onChange={set('bio')}
          placeholder="Tell readers about yourself…"
          rows={4}
          maxLength={500}
        />
        <span className={styles.hint}>{form.bio.length}/500</span>
      </div>

      <div className={styles.sectionTitle}>Social Links</div>

      {([
        { field: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/username' },
        { field: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/username' },
        { field: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/username' },
        { field: 'linkedinUrl', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
        { field: 'websiteUrl', label: 'Website', placeholder: 'https://yourwebsite.com' },
      ] as const).map(({ field, label, placeholder }) => (
        <div className={styles.field} key={field}>
          <label className={styles.label}>{label}</label>
          <input
            type="url"
            className={styles.input}
            value={form[field]}
            onChange={set(field)}
            placeholder={placeholder}
          />
        </div>
      ))}

      {error && <p className={styles.error}>{error}</p>}
      {saved && <p className={styles.success}>Profile saved! Redirecting…</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.push(`/author/${author.id}/${slugify(author.name)}`)}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
