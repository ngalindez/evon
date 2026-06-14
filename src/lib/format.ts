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
