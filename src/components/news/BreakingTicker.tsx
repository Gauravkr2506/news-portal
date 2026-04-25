import Link from 'next/link'
import styles from './BreakingTicker.module.scss'
import type { ArticleWithRelations } from '@/types'

interface BreakingTickerProps {
  articles: Pick<ArticleWithRelations, 'id' | 'title' | 'slug'>[]
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  if (!articles.length) return null

  // Duplicate articles for seamless loop
  const doubled = [...articles, ...articles]

  return (
    <div className={styles.ticker} role="marquee" aria-label="Breaking news">
      <div className={styles.label}>Breaking</div>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {doubled.map((article, i) => (
            <Link
              key={`${article.id}-${i}`}
              href={`/article/${article.slug}`}
              className={styles.item}
            >
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
