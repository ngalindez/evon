import { Sidebar } from '@/components/panel/Sidebar'
import { Topbar } from '@/components/panel/Topbar'
import type { ReactNode } from 'react'

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="evk-app">
      <Sidebar />
      <div className="evk-main">
        <Topbar />
        <div className="evk-scroll">{children}</div>
      </div>
    </div>
  )
}
