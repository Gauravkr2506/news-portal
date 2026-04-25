'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CategoryManager.module.scss'
import type { Category } from '@/lib/db/schema'

interface Props {
  categories: Category[]
}

const COLORS = ['#dc2626','#ea580c','#d97706','#16a34a','#0891b2','#2563eb','#7c3aed','#db2777','#475569']
const DEFAULT_FORM = { name: '', description: '', color: '#2563eb', icon: '', sortOrder: 0, isActive: true }

export function CategoryManager({ categories: initialCats }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cats, setCats] = useState(initialCats)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [editing, setEditing] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const setField = <K extends keyof typeof DEFAULT_FORM>(key: K, value: typeof DEFAULT_FORM[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const startEdit = (cat: Category) => {
    setEditing(cat)
    setForm({
      name: cat.name, description: cat.description || '',
      color: cat.color || '#2563eb', icon: cat.icon || '',
      sortOrder: cat.sortOrder, isActive: cat.isActive,
    })
    setError('')
  }

  const cancelEdit = () => { setEditing(null); setForm(DEFAULT_FORM); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setError('')
    startTransition(async () => {
      try {
        const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
        const method = editing ? 'PATCH' : 'POST'
        const res = await fetch(url, {
          method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed')
        router.refresh()
        cancelEdit()
        if (editing) {
          setCats((prev) => prev.map((c) => (c.id === editing.id ? json : c)))
        } else {
          setCats((prev) => [...prev, json])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed')
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Articles in this category will be uncategorized.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error) }
      setCats((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      })
      if (!res.ok) return
      setCats((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c)))
    } catch {}
  }

  return (
    <div className={styles.layout}>
      {/* Form */}
      <div className={styles.formSection}>
        <h2 className={styles.formTitle}>{editing ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              type="text" value={form.name} onChange={(e) => setField('name', e.target.value)}
              placeholder="Category name" className={styles.input} maxLength={100}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              value={form.description} onChange={(e) => setField('description', e.target.value)}
              placeholder="Short description" className={styles.textarea} rows={2}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorPicker}>
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  className={`${styles.colorSwatch} ${form.color === c ? styles.selectedColor : ''}`}
                  style={{ background: c }} onClick={() => setField('color', c)}
                  title={c}
                />
              ))}
              <input type="color" value={form.color} onChange={(e) => setField('color', e.target.value)} className={styles.colorInput} title="Custom color" />
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Icon (emoji)</label>
              <input
                type="text" value={form.icon} onChange={(e) => setField('icon', e.target.value)}
                placeholder="📰" className={styles.input} maxLength={10}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sort Order</label>
              <input
                type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', Number(e.target.value))}
                className={styles.input} min={0}
              />
            </div>
          </div>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />
            Active (visible on site)
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            {editing && (
              <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
            )}
            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className={styles.list}>
        {cats.length === 0 && <p className={styles.empty}>No categories yet.</p>}
        {cats.map((cat) => (
          <div key={cat.id} className={`${styles.catItem} ${!cat.isActive ? styles.inactive : ''}`}>
            <div className={styles.catDot} style={{ background: cat.color || '#ccc' }} />
            <div className={styles.catInfo}>
              <div className={styles.catName}>
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
                {!cat.isActive && <span className={styles.inactiveBadge}>Inactive</span>}
              </div>
              {cat.description && <p className={styles.catDesc}>{cat.description}</p>}
            </div>
            <div className={styles.catActions}>
              <button
                type="button" onClick={() => toggleActive(cat)}
                className={styles.iconBtn} title={cat.isActive ? 'Deactivate' : 'Activate'}
              >
                {cat.isActive ? '👁' : '🚫'}
              </button>
              <button type="button" onClick={() => startEdit(cat)} className={styles.iconBtn} title="Edit">✏️</button>
              <button
                type="button" onClick={() => handleDelete(cat.id)}
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                disabled={deleting === cat.id} title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
