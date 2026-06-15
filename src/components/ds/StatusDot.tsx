'use client'
import type { HTMLAttributes } from 'react'

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
