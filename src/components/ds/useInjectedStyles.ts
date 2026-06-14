'use client'
import { useEffect } from 'react'

export function useInjectedStyles(id: string, css: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = css
    document.head.appendChild(el)
  }, [id, css])
}
