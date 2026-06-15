'use client'
import type { HTMLAttributes, ReactNode } from 'react'

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
