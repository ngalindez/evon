'use client'
import type { HTMLAttributes, ReactNode } from 'react'

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
