'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
}

export function ClickableTableRow({ href, children }: Props) {
  const router = useRouter()

  return (
    <tr className="evk-table__row--clickable" onClick={() => router.push(href)}>
      {children}
    </tr>
  )
}
