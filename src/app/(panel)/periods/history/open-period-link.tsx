'use client'

import { setActivePeriodAction } from '@/server/active/actions'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useTransition } from 'react'

type Props = {
  year: number
  month: number
  children: ReactNode
}

/**
 * Sets the active-period cookie to (year, month) and navigates to /periods so the review
 * screen loads under that selection.
 */
export function OpenPeriodLink({ year, month, children }: Props) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const handle = () =>
    start(async () => {
      await setActivePeriodAction(`${year}-${String(month).padStart(2, '0')}`)
      router.push('/periods')
    })
  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      style={{
        background: 'transparent',
        border: 0,
        padding: 0,
        cursor: pending ? 'progress' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}
