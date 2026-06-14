'use client'
import type { HTMLAttributes } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-statusdot { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-secondary); }
.evon-statusdot__dot { width: 9px; height: 9px; border-radius: 50%; flex: none; position: relative; }
.evon-statusdot__dot--online { background: var(--charge-live); }
.evon-statusdot__dot--idle { background: var(--charge-idle); }
.evon-statusdot__dot--offline { background: var(--charge-offline); }
.evon-statusdot--pulse .evon-statusdot__dot--online { box-shadow: 0 0 0 0 rgba(182,240,0,0.5); animation: evon-pulse 1.8s ease-out infinite; }
@keyframes evon-pulse {
  0% { box-shadow: 0 0 0 0 rgba(182,240,0,0.45); }
  70% { box-shadow: 0 0 0 7px rgba(182,240,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(182,240,0,0); }
}
@media (prefers-reduced-motion: reduce) { .evon-statusdot--pulse .evon-statusdot__dot--online { animation: none; } }
`

export type DeviceStatus = 'online' | 'idle' | 'offline'

const LABELS: Record<DeviceStatus, string> = {
  online: 'En línea',
  idle: 'Inactivo',
  offline: 'Sin conexión',
}

export type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  status?: DeviceStatus
  label?: string | null
  pulse?: boolean
}

export function StatusDot({
  status = 'online',
  label,
  pulse = false,
  className = '',
  ...rest
}: StatusDotProps) {
  useInjectedStyles('evon-statusdot-styles', CSS)
  const text = label === undefined ? LABELS[status] : label
  return (
    <span
      className={['evon-statusdot', pulse ? 'evon-statusdot--pulse' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span className={`evon-statusdot__dot evon-statusdot__dot--${status}`} aria-hidden="true" />
      {text && <span>{text}</span>}
    </span>
  )
}
