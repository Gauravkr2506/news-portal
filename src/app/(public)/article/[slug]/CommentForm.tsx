'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { submitComment } from './actions'
import styles from './page.module.scss'

export function CommentFormInline({ articleId }: { articleId: number }) {
  const [state, action, pending] = useActionState(submitComment, null)

  if (state?.success) {
    return (
      <div className={styles.commentSuccess}>
        Your comment has been submitted and is awaiting approval.
      </div>
    )
  }

  return (
    <form action={action} className={styles.commentForm}>
      <input type="hidden" name="articleId" value={articleId} />
      <div className={styles.commentFormRow}>
        <Input name="guestName" label="Name" placeholder="Your name" required />
        <Input name="guestEmail" label="Email" type="email" placeholder="your@email.com" hint="Not published" />
      </div>
      <Textarea name="content" label="Comment" placeholder="Share your thoughts..." required rows={4} />
      {state?.error && <p className={styles.commentError}>{state.error}</p>}
      <Button type="submit" loading={pending} size="lg">Post Comment</Button>
    </form>
  )
}
