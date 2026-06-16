'use client'

import { Button } from '@/components/ds/Button'
import { useState } from 'react'

type Props = {
  action: () => Promise<unknown>
  confirmText: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Confirm-then-submit delete trigger.
 *
 * Plain English: click once → native confirm() dialog → if confirmed, the server action runs.
 * Keeping it minimal — a modal/dialog component isn't worth pulling in for the demo.
 */
export function DeleteButton({ action, confirmText, label = 'Eliminar', size = 'sm' }: Props) {
  const [pending, setPending] = useState(false)
  return (
    <Button
      type="button"
      variant="danger"
      size={size}
      loading={pending}
      onClick={async () => {
        if (!confirm(confirmText)) return
        setPending(true)
        try {
          await action()
        } finally {
          setPending(false)
        }
      }}
    >
      {label}
    </Button>
  )
}
