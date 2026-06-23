'use client'

import { Button } from '@/components/ds/Button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  /** Bound triggerReadAction. Returns ok:false + message on failure. */
  action: () => Promise<{ ok: boolean; error?: string }>
}

/** "Leer ahora": re-read the device's cumulative counter, then refresh the page on success. */
export function ReadNowButton({ action }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Button
        type="button"
        variant="secondary"
        loading={pending}
        iconLeft={<RefreshCw size={14} strokeWidth={1.9} />}
        onClick={async () => {
          setError(null)
          setPending(true)
          try {
            const res = await action()
            if (!res.ok) setError(res.error ?? 'No se pudo leer el dispositivo')
            else router.refresh()
          } finally {
            setPending(false)
          }
        }}
      >
        Leer ahora
      </Button>
      {error && (
        <span style={{ color: 'var(--danger-text)', fontSize: 'var(--text-sm)' }}>{error}</span>
      )}
    </div>
  )
}
