'use client'

import { setActiveBuildingAction } from '@/server/active/actions'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'

type BuildingOption = {
  id: string
  name: string
  address: string | null
  distribuidora: string
}

type Props = {
  active: BuildingOption | null
  options: BuildingOption[]
}

export function BuildingPicker({ active, options }: Props) {
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

  function pick(id: string) {
    if (id === active?.id) {
      setOpen(false)
      return
    }
    startTransition(async () => {
      await setActiveBuildingAction(id)
      setOpen(false)
    })
  }

  if (!active) {
    return (
      <div className="evk-consorcio" style={{ opacity: 0.6 }}>
        <Building2 size={18} strokeWidth={1.9} />
        <span>Sin consorcios cargados</span>
      </div>
    )
  }

  const label = active.address ? `${active.name} — ${active.address}` : active.name

  return (
    <div ref={wrapRef} className="evk-picker">
      <button
        type="button"
        className="evk-consorcio"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
      >
        <Building2 size={18} strokeWidth={1.9} />
        <span>{label}</span>
        <ChevronsUpDown size={15} strokeWidth={1.9} />
      </button>
      {open && (
        <ul className="evk-picker__menu">
          {options.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`evk-picker__item${b.id === active.id ? ' is-active' : ''}`}
                onClick={() => pick(b.id)}
              >
                <span className="evk-picker__item-main">
                  <strong>{b.name}</strong>
                  {b.address && <span>{b.address}</span>}
                </span>
                <span className="evk-picker__item-meta">{b.distribuidora}</span>
                {b.id === active.id && <Check size={14} strokeWidth={2.4} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
