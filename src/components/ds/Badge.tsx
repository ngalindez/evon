'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-sans); font-weight: var(--weight-semibold);
  font-size: var(--text-2xs); line-height: 1; letter-spacing: 0.01em;
  padding: 4px 9px; border-radius: var(--radius-pill);
  border: 1px solid transparent; white-space: nowrap;
}
.evon-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.evon-badge--neutral { background: var(--neutral-100); color: var(--neutral-700); }
.evon-badge--brand   { background: var(--brand-soft); color: var(--text-brand); }
.evon-badge--success { background: var(--success-soft); color: var(--success-text); }
.evon-badge--warning { background: var(--warning-soft); color: var(--warning-text); }
.evon-badge--danger  { background: var(--danger-soft); color: var(--danger-text); }
.evon-badge--info    { background: var(--info-soft); color: var(--info-text); }
.evon-badge--live    { background: var(--pine-800); color: var(--volt-300); }
.evon-badge--live .evon-badge__dot { background: var(--volt-400); box-shadow: 0 0 0 3px rgba(182,240,0,0.25); }
`

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
  useInjectedStyles('evon-badge-styles', CSS)
  const classes = ['evon-badge', `evon-badge--${tone}`, className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...rest}>
      {dot && <span className="evon-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
