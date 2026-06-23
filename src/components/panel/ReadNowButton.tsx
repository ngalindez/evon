'use client'

import { Button } from '@/components/ds/Button'
import { Toast } from '@/components/panel/Toast'
import { readActionFailureMessage, type ReadActionResult } from '@/lib/read-action-result'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

type Props = {
  /** Bound triggerReadAction. Returns ok:false + message on failure. */
  action: () => Promise<ReadActionResult>
  children?: ReactNode
}

/** "Leer ahora": re-read the device's cumulative counter, then refresh the page on success. */
export function ReadNowButton({ action, children }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dismissError = useCallback(() => setError(null), [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          loading={pending}
          iconLeft={<RefreshCw size={14} strokeWidth={1.9} />}
          onClick={async () => {
            setError(null)
            setPending(true)
            let result: ReadActionResult | undefined
            let thrown: unknown
            try {
              result = await action()
            } catch (err) {
              thrown = err
            } finally {
              setPending(false)
            }

            const message = readActionFailureMessage(result, thrown)
            if (message) {
              setError(message)
              return
            }

            router.refresh()
          }}
        >
          Leer ahora
        </Button>
        {children}
      </div>
      {error && (
        <Toast tone="danger" title="Lectura fallida" onDismiss={dismissError}>
          {error}
        </Toast>
      )}
    </>
  )
}
