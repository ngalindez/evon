'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-card {
  background: var(--surface-card); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-card); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
}
.evon-card--pad { padding: var(--space-6); }
.evon-card--interactive { cursor: pointer; transition: var(--transition-control); }
.evon-card--interactive:hover { box-shadow: var(--shadow-md); border-color: var(--border-default); transform: translateY(-1px); }
.evon-card--inverse { background: var(--surface-inverse); border-color: var(--border-inverse); color: var(--text-inverse); }
.evon-card__header { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--border-subtle); }
.evon-card__header-text { display: flex; flex-direction: column; gap: 3px; }
.evon-card__title { font: var(--type-h4); margin: 0; }
.evon-card__subtitle { font: var(--type-body-sm); color: var(--text-secondary); margin: 0; }
.evon-card__action { margin-left: auto; }
.evon-card__body { padding: var(--space-6); }
.evon-card__footer { padding: var(--space-4) var(--space-6); border-top: 1px solid var(--border-subtle); display: flex; align-items: center; gap: var(--space-3); }
`

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  padded?: boolean
  interactive?: boolean
  inverse?: boolean
}

export function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  padded = false,
  interactive = false,
  inverse = false,
  className = '',
  ...rest
}: CardProps) {
  useInjectedStyles('evon-card-styles', CSS)
  const hasHeader = title || subtitle || action
  const classes = [
    'evon-card',
    padded && !hasHeader && !footer ? 'evon-card--pad' : '',
    interactive ? 'evon-card--interactive' : '',
    inverse ? 'evon-card--inverse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {hasHeader && (
        <div className="evon-card__header">
          <div className="evon-card__header-text">
            {title && <h3 className="evon-card__title">{title}</h3>}
            {subtitle && <p className="evon-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="evon-card__action">{action}</div>}
        </div>
      )}
      {hasHeader || footer ? <div className="evon-card__body">{children}</div> : children}
      {footer && <div className="evon-card__footer">{footer}</div>}
    </div>
  )
}
