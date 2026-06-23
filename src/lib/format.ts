export function fmtNum(n: number, dec = 1): string {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  })
}

export function fmtMoney(n: number): string {
  return `$ ${n.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/** Human "hace X" relative time in Spanish. `emptyLabel` is shown when there's no date. */
export function formatRelative(date: Date | null, now: Date, emptyLabel = '—'): string {
  if (!date) return emptyLabel
  const min = Math.floor((now.getTime() - date.getTime()) / 60_000)
  if (min < 1) return 'hace instantes'
  if (min < 60) return `hace ${min} min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `hace ${hr} h`
  const days = Math.floor(hr / 24)
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`
}
