'use client'

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react'

type PanelChromeContextValue = {
  pendingPeriodCount: number
  adjustPendingPeriodCount: (delta: number) => void
}

const PanelChromeContext = createContext<PanelChromeContextValue | null>(null)

export function PanelChromeProvider({
  initialPendingPeriodCount,
  children,
}: {
  initialPendingPeriodCount: number
  children: ReactNode
}) {
  const [pendingPeriodCount, setPendingPeriodCount] = useState(initialPendingPeriodCount)
  const adjustPendingPeriodCount = useCallback((delta: number) => {
    setPendingPeriodCount((count) => Math.max(0, count + delta))
  }, [])
  const value = useMemo(
    () => ({ pendingPeriodCount, adjustPendingPeriodCount }),
    [pendingPeriodCount, adjustPendingPeriodCount],
  )
  return <PanelChromeContext.Provider value={value}>{children}</PanelChromeContext.Provider>
}

export function usePanelChrome(): PanelChromeContextValue {
  const ctx = useContext(PanelChromeContext)
  if (!ctx) {
    throw new Error('usePanelChrome must be used within PanelChromeProvider')
  }
  return ctx
}
