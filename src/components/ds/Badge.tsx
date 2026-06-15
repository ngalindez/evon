'use client'
import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'live'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  dot?: boolean
  children?: ReactNode
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
  className = '',
  ...rest
}: BadgeProps) {
  const classes = ['evon-badge', `evon-badge--${tone}`, className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...rest}>
      {dot && <span className="evon-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
