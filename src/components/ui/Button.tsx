import styles from './Button.module.scss'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  rounded?: boolean
  loading?: boolean
  as?: 'button'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  rounded,
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        styles.btn,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.full,
        rounded && styles.round,
        className
      )}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
