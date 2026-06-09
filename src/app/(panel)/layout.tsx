import type { ReactNode } from 'react'

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 p-4">
        <nav className="mx-auto flex max-w-4xl gap-4 text-sm">
          <a className="font-semibold" href="/buildings">
            Edificios
          </a>
          <a href="/periods">Períodos</a>
          <a href="/tariffs">Tarifas</a>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl p-4">{children}</main>
    </div>
  )
}
