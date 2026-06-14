'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-sans); font-weight: var(--weight-medium);
  font-size: var(--text-xs); line-height: 1; color: var(--text-secondary);
  background: var(--surface-card); border: 1px solid var(--border-default);
  padding: 5px 10px; border-radius: var(--radius-sm); white-space: nowrap;
}
.evon-tag--mono { font-family: var(--font-mono); }
.evon-tag svg { width: 14px; height: 14px; }
`

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode
  mono?: boolean
  children?: ReactNode
}

export function Tag({ children, icon, mono = false, className = '', ...rest }: TagProps) {
  useInjectedStyles('evon-tag-styles', CSS)
  const classes = ['evon-tag', mono ? 'evon-tag--mono' : '', className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...rest}>
      {icon}
      {children}
    </span>
  )
}
