'use client'
import type { HTMLAttributes, ReactNode } from 'react'

export type ProgressTone = 'brand' | 'volt' | 'warning' | 'danger'

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value?: number
  max?: number
  label?: ReactNode
  showValue?: boolean
  valueText?: string
  tone?: ProgressTone
  size?: 'md' | 'lg'
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  valueText,
  tone = 'brand',
  size = 'md',
  className = '',
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={['evon-progress', className].filter(Boolean).join(' ')} {...rest}>
      {(label || showValue) && (
        <div className="evon-progress__head">
          {label && <span className="evon-progress__label">{label}</span>}
          {showValue && (
            <span className="evon-progress__value">{valueText || `${Math.round(pct)}%`}</span>
          )}
        </div>
      )}
      <div
        className={['evon-progress__track', size === 'lg' ? 'evon-progress__track--lg' : '']
          .filter(Boolean)
          .join(' ')}
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <span
          className={`evon-progress__fill evon-progress__fill--${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
