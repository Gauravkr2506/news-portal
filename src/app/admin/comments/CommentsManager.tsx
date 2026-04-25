'use client'
import { useState } from 'react'
import styles from './CommentsManager.module.scss'
import type { Comment } from '@/lib/db/schema'

interface CommentRow extends Comment {
  articleTitle: string | null
  articleId: number
}

interface Props {
  comments: CommentRow[]
}

export function CommentsManager({ comments: initialComments }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [loading, setLoading] = useState<number | null>(null)

  const updateStatus = async (id: number, status: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      if (!res.ok) return
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    } finally {
      setLoading(null)
    }
  }

  const deleteComment = async (id: number) => {
    if (!confirm('Delete this comment?')) return
    setLoading(id)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setComments((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setLoading(null)
    }
  }

  if (comments.length === 0) {
    return <div className={styles.empty}>No comments found.</div>
  }

  return (
    <div className={styles.list}>
      {comments.map((comment) => (
        <div key={comment.id} className={`${styles.card} ${styles[comment.status]}`}>
          <div className={styles.cardHeader}>
            <div className={styles.meta}>
              <span className={styles.author}>{comment.guestName || 'User'}</span>
              {comment.guestEmail && <span className={styles.email}>{comment.guestEmail}</span>}
              <span className={styles.dot}>·</span>
              <span className={styles.article}>{comment.articleTitle || `Article #${comment.articleId}`}</span>
              <span className={styles.dot}>·</span>
              <time className={styles.date}>{new Date(comment.createdAt).toLocaleDateString('en-IN')}</time>
            </div>
            <span className={`${styles.badge} ${styles[`badge_${comment.status}`]}`}>{comment.status}</span>
          </div>
          <p className={styles.content}>{comment.content}</p>
          <div className={styles.actions}>
            {comment.status !== 'approved' && (
              <button
                onClick={() => updateStatus(comment.id, 'approved')}
                className={`${styles.btn} ${styles.approveBtn}`}
                disabled={loading === comment.id}
              >
                Approve
              </button>
            )}
            {comment.status !== 'rejected' && (
              <button
                onClick={() => updateStatus(comment.id, 'rejected')}
                className={`${styles.btn} ${styles.rejectBtn}`}
                disabled={loading === comment.id}
              >
                Reject
              </button>
            )}
            {comment.status !== 'pending' && (
              <button
                onClick={() => updateStatus(comment.id, 'pending')}
                className={`${styles.btn} ${styles.pendingBtn}`}
                disabled={loading === comment.id}
              >
                Mark Pending
              </button>
            )}
            <button
              onClick={() => deleteComment(comment.id)}
              className={`${styles.btn} ${styles.deleteBtn}`}
              disabled={loading === comment.id}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
