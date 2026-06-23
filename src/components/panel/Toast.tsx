'use client'

import { Alert, type AlertTone } from '@/components/ds/Alert'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  title: string
  children: ReactNode
  tone?: AlertTone
  onDismiss: () => void
  autoDismissMs?: number
}

export function Toast({
  title,
  children,
  tone = 'danger',
  onDismiss,
  autoDismissMs = 8000,
}: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!autoDismissMs) return
    const timer = window.setTimeout(onDismiss, autoDismissMs)
    return () => window.clearTimeout(timer)
  }, [autoDismissMs, onDismiss, title, children])

  if (!mounted) return null

  return createPortal(
    <div className="evk-toast-layer">
      <div className="evk-toast-wrap">
        <Alert tone={tone} title={title} className="evk-toast" role="alert">
          {children}
        </Alert>
        <button type="button" className="evk-toast__close" onClick={onDismiss} aria-label="Cerrar">
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  )
}
