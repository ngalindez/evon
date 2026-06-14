'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-stat { display: flex; flex-direction: column; gap: 6px; }
.evon-stat__label { font: var(--weight-semibold) var(--text-2xs)/1.2 var(--font-sans); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--text-tertiary); }
.evon-stat__value { font-family: var(--font-sans); font-weight: var(--weight-bold); font-size: 30px; line-height: 1; color: var(--text-primary); font-variant-numeric: tabular-nums; letter-spacing: var(--tracking-tight); }
.evon-stat__value .unit { font-size: 16px; font-weight: var(--weight-semibold); color: var(--text-tertiary); margin-left: 4px; }
.evon-stat__value--mono { font-family: var(--font-mono); }
.evon-stat__foot { display: flex; align-items: center; gap: 6px; font-size: var(--text-xs); color: var(--text-secondary); }
.evon-stat__delta { display: inline-flex; align-items: center; gap: 3px; font-weight: var(--weight-semibold); font-variant-numeric: tabular-nums; }
.evon-stat__delta--up { color: var(--success-text); }
.evon-stat__delta--down { color: var(--danger-text); }
.evon-stat__delta svg { width: 13px; height: 13px; }
`

export type StatProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  value: ReactNode
  unit?: ReactNode
  mono?: boolean
  delta?: ReactNode
  deltaDirection?: 'up' | 'down'
  footnote?: ReactNode
}

export function Stat({
  label,
  value,
  unit,
  mono = false,
  delta,
  deltaDirection = 'up',
  footnote,
  className = '',
  ...rest
}: StatProps) {
  useInjectedStyles('evon-stat-styles', CSS)
  return (
    <div className={['evon-stat', className].filter(Boolean).join(' ')} {...rest}>
      {label && <div className="evon-stat__label">{label}</div>}
      <div
        className={['evon-stat__value', mono ? 'evon-stat__value--mono' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {(delta || footnote) && (
        <div className="evon-stat__foot">
          {delta && (
            <span className={`evon-stat__delta evon-stat__delta--${deltaDirection}`}>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={deltaDirection === 'up' ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'} />
              </svg>
              {delta}
            </span>
          )}
          {footnote && <span>{footnote}</span>}
        </div>
      )}
    </div>
  )
}
