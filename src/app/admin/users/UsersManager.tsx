'use client'
import { useState } from 'react'
import Image from 'next/image'
import styles from './UsersManager.module.scss'
import type { User } from '@/lib/db/schema'

interface Props {
  users: User[]
  currentUserId: string
}

export function UsersManager({ users: initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (id: string, data: Record<string, unknown>) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error || 'Failed'); return }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...json } : u)))
    } finally {
      setLoading(null)
    }
  }

  const setRole = (id: string, role: string) => update(id, { role })

  const toggleBan = (user: User) => {
    if (user.banned) {
      update(user.id, { banned: false, banReason: null })
    } else {
      const reason = prompt('Ban reason (optional):') ?? ''
      update(user.id, { banned: true, banReason: reason || null })
    }
  }

  return (
    <div className={styles.table}>
      <table className={styles.t}>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isMe = user.id === currentUserId
            return (
              <tr key={user.id} className={user.banned ? styles.bannedRow : ''}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      {user.image
                        ? <Image src={user.image} alt={user.name} width={32} height={32} />
                        : <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <div className={styles.userName}>{user.name} {isMe && <span className={styles.youBadge}>you</span>}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.email}>
                  {user.email}
                  {user.emailVerified && <span className={styles.verified} title="Verified">✓</span>}
                </td>
                <td>
                  {isMe ? (
                    <span className={`${styles.role} ${styles[`role_${user.role}`]}`}>{user.role}</span>
                  ) : (
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => setRole(user.id, e.target.value)}
                      className={styles.roleSelect}
                      disabled={loading === user.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  )}
                </td>
                <td>
                  {user.banned
                    ? <span className={styles.bannedBadge} title={user.banReason || ''}>Banned</span>
                    : <span className={styles.activeBadge}>Active</span>
                  }
                </td>
                <td className={styles.date}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => toggleBan(user)}
                      className={`${styles.banBtn} ${user.banned ? styles.unbanBtn : ''}`}
                      disabled={loading === user.id}
                    >
                      {user.banned ? 'Unban' : 'Ban'}
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
