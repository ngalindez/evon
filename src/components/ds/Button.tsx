'use client'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const classes = [
    'evon-btn',
    `evon-btn--${variant}`,
    `evon-btn--${size}`,
    fullWidth ? 'evon-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const isDisabled = disabled || loading
  return (
    <button type={type} className={classes} disabled={isDisabled} {...rest}>
      {loading && <span className="evon-btn__spinner" aria-hidden="true" />}
      {!loading && iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </button>
  )
}
