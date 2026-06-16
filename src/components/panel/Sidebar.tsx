'use client'
import {
  Building2,
  CalendarCheck2,
  LayoutDashboard,
  Percent,
  PlugZap,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePanelChrome } from './PanelChromeProvider'

type Item = {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const ITEMS: Item[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/periods', label: 'Período', icon: CalendarCheck2 },
  { href: '/devices', label: 'Dispositivos', icon: PlugZap },
  { href: '/tariffs', label: 'Tarifas y margen', icon: Percent },
  { href: '/buildings', label: 'Consorcios', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { pendingPeriodCount } = usePanelChrome()
  return (
    <aside className="evk-sidebar">
      <div className="evk-sidebar__brand">
        <span className="evk-sidebar__brand-lockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/evon-mark.png" alt="" height={72} width={72} />
          <strong>evon</strong>
        </span>
      </div>

      <nav className="evk-nav">
        {ITEMS.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`)
          const Icon = it.icon
          const badge =
            it.href === '/periods' && pendingPeriodCount > 0
              ? String(pendingPeriodCount)
              : undefined
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`evk-nav__item${active ? ' is-active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{it.label}</span>
              {badge && <span className="evk-nav__badge">{badge}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="evk-sidebar__foot">
        <Link
          href="/settings"
          className={`evk-nav__item${pathname.startsWith('/settings') ? ' is-active' : ''}`}
        >
          <Settings size={19} strokeWidth={1.9} />
          <span>Configuración</span>
        </Link>
        <div className="evk-account">
          <span className="evk-account__av">MG</span>
          <div className="evk-account__txt">
            <strong>Marina Gómez</strong>
            <span>Admin · 12 consorcios</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
