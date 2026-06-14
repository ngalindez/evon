'use client'
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  FileDown,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../ds/Button'

type Props = {
  onGenerate?: () => void
}

export function Topbar({ onGenerate }: Props) {
  return (
    <header className="evk-topbar">
      <div className="evk-topbar__left">
        <button type="button" className="evk-consorcio">
          <Building2 size={18} strokeWidth={1.9} />
          <span>Torres del Río — Av. Libertador 4820</span>
          <ChevronsUpDown size={15} strokeWidth={1.9} />
        </button>
        <span className="evk-topbar__divider" />
        <button type="button" className="evk-period">
          <Calendar size={16} strokeWidth={1.9} />
          <span>Junio 2026</span>
          <ChevronDown size={15} strokeWidth={1.9} />
        </button>
      </div>

      <div className="evk-topbar__right">
        <span className="evk-sync">
          <RefreshCw size={15} strokeWidth={1.9} />
          Sincronizado hace 6 min
        </span>
        <Button iconLeft={<FileDown size={17} strokeWidth={1.9} />} onClick={onGenerate}>
          Generar archivo
        </Button>
        <button type="button" className="evk-iconbtn-bare" aria-label="Notificaciones">
          <Bell size={19} strokeWidth={1.9} />
          <span className="evk-dot" />
        </button>
      </div>
    </header>
  )
}
