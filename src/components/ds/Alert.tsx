'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-alert {
  display: flex; gap: 12px; align-items: flex-start;
  border: 1px solid var(--_bd, var(--border-subtle)); border-radius: var(--radius-lg);
  background: var(--_bg, var(--surface-card)); padding: 14px 16px;
  font-family: var(--font-sans);
}
.evon-alert__icon { flex: none; width: 20px; height: 20px; color: var(--_ic, var(--text-secondary)); margin-top: 1px; }
.evon-alert__icon svg { width: 20px; height: 20px; }
.evon-alert__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.evon-alert__title { font: var(--type-label); color: var(--_tc, var(--text-primary)); }
.evon-alert__msg { font-size: var(--text-sm); line-height: 1.5; color: var(--text-secondary); }
.evon-alert--info    { --_bg: var(--info-soft); --_bd: transparent; --_ic: var(--info); --_tc: var(--info-text); }
.evon-alert--success { --_bg: var(--success-soft); --_bd: transparent; --_ic: var(--success); --_tc: var(--success-text); }
.evon-alert--warning { --_bg: var(--warning-soft); --_bd: transparent; --_ic: var(--warning); --_tc: var(--warning-text); }
.evon-alert--danger  { --_bg: var(--danger-soft); --_bd: transparent; --_ic: var(--danger); --_tc: var(--danger-text); }
`

const ICON_PATHS: Record<string, string> = {
  info: 'M12 16v-4 M12 8h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  success: 'M9 12l2 2 4-4 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  warning:
    'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  danger: 'M12 8v4 M12 16h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  tone?: AlertTone
  children?: ReactNode
}

export function Alert({ children, title, tone = 'info', className = '', ...rest }: AlertProps) {
  useInjectedStyles('evon-alert-styles', CSS)
  const classes = ['evon-alert', `evon-alert--${tone}`, className].filter(Boolean).join(' ')
  return (
    <div className={classes} role={tone === 'danger' ? 'alert' : 'status'} {...rest}>
      <span className="evon-alert__icon" aria-hidden="true">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICON_PATHS[tone]} />
        </svg>
      </span>
      <div className="evon-alert__body">
        {title && <div className="evon-alert__title">{title}</div>}
        {children && <div className="evon-alert__msg">{children}</div>}
      </div>
    </div>
  )
}
