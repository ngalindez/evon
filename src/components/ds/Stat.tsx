'use client'
import type { HTMLAttributes, ReactNode } from 'react'

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
