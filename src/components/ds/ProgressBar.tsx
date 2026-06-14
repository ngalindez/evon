'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-progress { display: flex; flex-direction: column; gap: 7px; }
.evon-progress__head { display: flex; align-items: baseline; justify-content: space-between; font-family: var(--font-sans); }
.evon-progress__label { font: var(--type-label); color: var(--text-primary); }
.evon-progress__value { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.evon-progress__track { height: 8px; border-radius: var(--radius-pill); background: var(--neutral-200); overflow: hidden; }
.evon-progress__track--lg { height: 12px; }
.evon-progress__fill { height: 100%; border-radius: inherit; background: var(--brand); transition: width var(--duration-slow) var(--ease-out); display: block; }
.evon-progress__fill--volt { background: var(--volt-400); }
.evon-progress__fill--warning { background: var(--warning); }
.evon-progress__fill--danger { background: var(--danger); }
`

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
  useInjectedStyles('evon-progress-styles', CSS)
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
