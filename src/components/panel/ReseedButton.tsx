'use client'

import { Alert } from '@/components/ds/Alert'
import { Button } from '@/components/ds/Button'
import { RefreshCw } from 'lucide-react'
import { useState, useTransition } from 'react'

type ReseedAction = () => Promise<
  | { ok: true; buildings: number; units: number; periods: number; readings: number }
  | { ok: false; error: string }
>

export function ReseedButton({ action }: { action: ReseedAction }) {
  const [pending, start] = useTransition()
  const [feedback, setFeedback] = useState<
    { tone: 'success'; message: string } | { tone: 'danger'; message: string } | null
  >(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Button
        type="button"
        variant="danger"
        loading={pending}
        iconLeft={<RefreshCw size={16} strokeWidth={1.9} />}
        onClick={() => {
          if (
            !confirm(
              'Esto borra TODA la información y vuelve a cargar los datos del piloto. ¿Continuar?',
            )
          )
            return
          setFeedback(null)
          start(async () => {
            const res = await action()
            if (res.ok) {
              setFeedback({
                tone: 'success',
                message: `Datos recargados: ${res.buildings} consorcios, ${res.units} unidades, ${res.periods} períodos, ${res.readings} lecturas.`,
              })
            } else {
              setFeedback({ tone: 'danger', message: res.error })
            }
          })
        }}
      >
        Re-cargar datos demo
      </Button>
      {feedback && (
        <Alert tone={feedback.tone} title={feedback.tone === 'success' ? 'Listo' : 'Error'}>
          {feedback.message}
        </Alert>
      )}
    </div>
  )
}
