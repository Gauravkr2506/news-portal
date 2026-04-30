'use client'

export function GoogleTranslateBtn() {
  const handleClick = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://translate.google.com/translate?sl=en&tl=hi&u=${url}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <button onClick={handleClick} title="Read in Hindi" aria-label="Translate to Hindi" style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '5px 10px', borderRadius: '999px',
      border: '1.5px solid var(--border)', background: 'transparent',
      color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
      cursor: 'pointer', transition: 'all 0.15s',
      lineHeight: 1,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      हिं
    </button>
  )
}
