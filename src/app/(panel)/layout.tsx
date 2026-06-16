import { countPeriodsPendingReview } from '@/server/billing'
import { PanelChromeProvider } from '@/components/panel/PanelChromeProvider'
import { Sidebar } from '@/components/panel/Sidebar'
import { Topbar } from '@/components/panel/Topbar'
import type { ReactNode } from 'react'

// Topbar queries Prisma + reads cookies on every render, so the panel can't be statically
// prerendered. Forcing dynamic at the layout level propagates to every child route — no need to
// add it to each page individually.
export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const pendingPeriodCount = await countPeriodsPendingReview()

  return (
    <PanelChromeProvider initialPendingPeriodCount={pendingPeriodCount}>
      <div className="evk-app">
        <Sidebar />
        <div className="evk-main">
          <Topbar />
          <div className="evk-scroll">{children}</div>
        </div>
      </div>
    </PanelChromeProvider>
  )
}
