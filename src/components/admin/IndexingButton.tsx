'use client'
import { useState } from 'react'
import styles from './IndexingButton.module.scss'

type State = 'idle' | 'loading' | 'success' | 'error'
type Result = { submitted: number; succeeded: number; failed: number }

export default function IndexingButton() {
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<Result | null>(null)

  async function handleClick() {
    setState('loading')
    setResult(null)
    try {
      const res = await fetch('/api/indexing', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setResult(data)
      setState('success')
    } catch {
      setState('error')
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.btn} ${state !== 'idle' ? styles[state] : ''}`}
        onClick={handleClick}
        disabled={state === 'loading'}
      >
        {state === 'loading' ? (
          <>
            <span className={styles.spinner} />
            Submitting…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Request Indexing
          </>
        )}
      </button>
      {state === 'success' && result && (
        <span className={styles.msgSuccess}>
          {result.submitted} URLs submitted — {result.succeeded} OK{result.failed > 0 ? `, ${result.failed} failed` : ''}
        </span>
      )}
      {state === 'error' && (
        <span className={styles.msgError}>Indexing request failed. Check API credentials.</span>
      )}
    </div>
  )
}
