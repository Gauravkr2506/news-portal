'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './DeleteArticleBtn.module.scss'

export function DeleteArticleBtn({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return
    setPending(true)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('Failed to delete article.')
      setPending(false)
    }
  }

  return (
    <button
      className={styles.btn}
      onClick={handleDelete}
      disabled={pending}
      title="Delete article"
      aria-label="Delete article"
    >
      🗑
    </button>
  )
}
