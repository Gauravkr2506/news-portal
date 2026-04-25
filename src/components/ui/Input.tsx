import styles from './Input.module.scss'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, rightIcon, className, id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            styles.input,
            !!icon && styles.hasIcon,
            !!rightIcon && styles.hasRightIcon,
            error && styles.error,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <p id={`${inputId}-error`} className={styles.errorMsg} role="alert">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  )
})

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(styles.input, styles.textarea, error && styles.error, className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      {!error && hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
})
