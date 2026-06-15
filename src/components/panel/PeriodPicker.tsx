'use client'

import { setActivePeriodAction } from '@/server/active/actions'
import type { PeriodStatus } from '@prisma/client'
import { Calendar, Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'

type Option = {
  year: number
  month: number
  status: PeriodStatus | null
}

type Props = {
  active: { year: number; month: number }
  options: Option[]
}

const MONTH_LABELS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const STATUS_LABELS: Record<PeriodStatus, string> = {
  open: 'Borrador',
  processing: 'Procesando',
  pending_review: 'En revisión',
  approved: 'Aprobado',
  exported: 'Exportado',
  failed: 'Falló',
}

function label(year: number, month: number): string {
  const m = MONTH_LABELS[month - 1] ?? '?'
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${year}`
}

function key(o: { year: number; month: number }) {
  return `${o.year}-${String(o.month).padStart(2, '0')}`
}

export function PeriodPicker({ active, options }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickAway(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [open])

  function pick(o: Option) {
    const k = key(o)
    if (k === key(active)) {
      setOpen(false)
      return
    }
    startTransition(async () => {
      await setActivePeriodAction(k)
      setOpen(false)
    })
  }

  return (
    <div ref={wrapRef} className="evk-picker">
      <button
        type="button"
        className="evk-period"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
      >
        <Calendar size={16} strokeWidth={1.9} />
        <span>{label(active.year, active.month)}</span>
        <ChevronDown size={15} strokeWidth={1.9} />
      </button>
      {open && (
        <ul className="evk-picker__menu">
          {options.length === 0 && (
            <li>
              <span
                className="evk-picker__item"
                style={{ color: 'var(--text-tertiary)', cursor: 'default' }}
              >
                Sin períodos
              </span>
            </li>
          )}
          {options.map((o) => {
            const isActive = key(o) === key(active)
            return (
              <li key={key(o)}>
                <button
                  type="button"
                  className={`evk-picker__item${isActive ? ' is-active' : ''}`}
                  onClick={() => pick(o)}
                >
                  <span className="evk-picker__item-main">
                    <strong>{label(o.year, o.month)}</strong>
                  </span>
                  <span className="evk-picker__item-meta">
                    {o.status ? STATUS_LABELS[o.status] : 'Sin abrir'}
                  </span>
                  {isActive && <Check size={14} strokeWidth={2.4} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
