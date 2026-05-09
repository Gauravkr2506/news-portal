'use client'
import { useState } from 'react'
import styles from './HomeSectionManager.module.scss'

type Section = {
  id: number
  title: string
  articleCount: number
  sortOrder: number
  isActive: boolean
  categoryId: number
  categoryName: string | null
  categorySlug: string | null
  categoryColor: string | null
}

type Category = {
  id: number
  name: string
  slug: string
}

interface Props {
  initialSections: Section[]
  categories: Category[]
}

const COUNT_OPTIONS = [3, 6, 9]

async function patch(id: number, body: object) {
  await fetch(`/api/home-sections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function HomeSectionManager({ initialSections, categories }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ categoryId: '', title: '', articleCount: '3' })
  const [saving, setSaving] = useState(false)

  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder)
  const usedIds = new Set(sections.map(s => s.categoryId))
  const available = categories.filter(c => !usedIds.has(c.id))

  async function addSection() {
    if (!form.categoryId || !form.title.trim()) return
    setSaving(true)
    const res = await fetch('/api/home-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: Number(form.categoryId),
        title: form.title.trim(),
        articleCount: Number(form.articleCount),
      }),
    })
    if (res.ok) {
      const created = await res.json()
      setSections(prev => [...prev, created])
      setAdding(false)
      setForm({ categoryId: '', title: '', articleCount: '3' })
    }
    setSaving(false)
  }

  async function deleteSection(id: number) {
    if (!confirm('Remove this section from the home page?')) return
    await fetch(`/api/home-sections/${id}`, { method: 'DELETE' })
    setSections(prev => prev.filter(s => s.id !== id))
  }

  async function toggleActive(section: Section) {
    const next = !section.isActive
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, isActive: next } : s))
    await patch(section.id, { isActive: next })
  }

  async function changeCount(section: Section, count: number) {
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, articleCount: count } : s))
    await patch(section.id, { articleCount: count })
  }

  async function move(idx: number, dir: 'up' | 'down') {
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    setSections(prev => prev.map(s => {
      if (s.id === a.id) return { ...s, sortOrder: b.sortOrder }
      if (s.id === b.id) return { ...s, sortOrder: a.sortOrder }
      return s
    }))
    await Promise.all([
      patch(a.id, { sortOrder: b.sortOrder }),
      patch(b.id, { sortOrder: a.sortOrder }),
    ])
  }

  function onCategoryChange(catId: string) {
    const cat = categories.find(c => c.id === Number(catId))
    setForm(f => ({ ...f, categoryId: catId, title: f.title || cat?.name || '' }))
  }

  return (
    <div className={styles.manager}>
      <div className={styles.list}>
        {sorted.length === 0 && (
          <div className={styles.empty}>
            No sections added yet. Click &ldquo;Add Section&rdquo; to display a category on the home page.
          </div>
        )}
        {sorted.map((section, idx) => (
          <div key={section.id} className={`${styles.row} ${!section.isActive ? styles.dimmed : ''}`}>
            <div className={styles.orderBtns}>
              <button
                className={styles.arrowBtn}
                onClick={() => move(idx, 'up')}
                disabled={idx === 0}
                aria-label="Move up"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
              <button
                className={styles.arrowBtn}
                onClick={() => move(idx, 'down')}
                disabled={idx === sorted.length - 1}
                aria-label="Move down"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <span
              className={styles.colorDot}
              style={{ background: section.categoryColor ?? '#3b82f6' }}
            />

            <div className={styles.info}>
              <div className={styles.rowTitle}>{section.title}</div>
              <div className={styles.rowMeta}>{section.categoryName}</div>
            </div>

            <div className={styles.controls}>
              <select
                value={section.articleCount}
                onChange={e => changeCount(section, Number(e.target.value))}
                className={styles.countSelect}
              >
                {COUNT_OPTIONS.map(n => (
                  <option key={n} value={n}>{n} articles</option>
                ))}
              </select>

              <button
                onClick={() => toggleActive(section)}
                className={`${styles.toggleBtn} ${section.isActive ? styles.on : styles.off}`}
              >
                {section.isActive ? 'Visible' : 'Hidden'}
              </button>

              <button
                onClick={() => deleteSection(section.id)}
                className={styles.deleteBtn}
                aria-label="Delete section"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className={styles.addForm}>
          <div className={styles.formFields}>
            <select
              value={form.categoryId}
              onChange={e => onCategoryChange(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select category…</option>
              {available.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Section title (e.g. Top Business Stories)"
              className={styles.formInput}
            />
            <select
              value={form.articleCount}
              onChange={e => setForm(f => ({ ...f, articleCount: e.target.value }))}
              className={styles.formSelect}
            >
              {COUNT_OPTIONS.map(n => (
                <option key={n} value={n}>{n} articles</option>
              ))}
            </select>
          </div>
          <div className={styles.formActions}>
            <button
              onClick={addSection}
              disabled={!form.categoryId || !form.title.trim() || saving}
              className={styles.saveBtn}
            >
              {saving ? 'Adding…' : 'Add Section'}
            </button>
            <button onClick={() => { setAdding(false); setForm({ categoryId: '', title: '', articleCount: '3' }) }} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={styles.newBtn} disabled={available.length === 0}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {available.length === 0 ? 'All categories added' : 'Add Section'}
        </button>
      )}
    </div>
  )
}
