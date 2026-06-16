'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/** Keeps row-level navigation from firing when clicking action buttons inside a table row. */
export function TableActionsCell({ children }: Props) {
  return (
    <td
      className="evk-table__actions"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </td>
  )
}
