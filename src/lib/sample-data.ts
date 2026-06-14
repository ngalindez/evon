import type { DeviceStatus } from '@/components/ds/StatusDot'

export type DeviceMaker = 'Shelly' | 'Sonoff' | 'Tuya'

export type DeviceRow = {
  uf: string
  maker: DeviceMaker
  id: string
  status: DeviceStatus
  prev: number
  curr: number | null
}

export type ComputedRow = DeviceRow & {
  kwh: number | null
  importe: number | null
}

export type Totals = {
  kwh: number
  importe: number
  read: number
  total: number
  missing: number
}

export const TARIFF = 84.02
export const MARGIN = 0.08

export const DEVICES: DeviceRow[] = [
  { uf: '3.º B', maker: 'Shelly', id: 'shelly-1a2b', status: 'online', prev: 8421.2, curr: 8569.8 },
  { uf: '5.º A', maker: 'Sonoff', id: 'sonoff-9f3c', status: 'online', prev: 4102.0, curr: 4194.0 },
  { uf: 'PB 2', maker: 'Tuya', id: 'tuya-77de', status: 'online', prev: 12044.5, curr: 12248.8 },
  { uf: '7.º D', maker: 'Shelly', id: 'shelly-4c5e', status: 'online', prev: 2210.4, curr: 2301.1 },
  { uf: '2.º A', maker: 'Sonoff', id: 'sonoff-2b8a', status: 'idle', prev: 6680.0, curr: 6680.0 },
  { uf: '9.º C', maker: 'Shelly', id: 'shelly-6f1d', status: 'online', prev: 990.6, curr: 1147.9 },
  { uf: '4.º B', maker: 'Tuya', id: 'tuya-3e90', status: 'offline', prev: 5521.0, curr: null },
  { uf: '8.º A', maker: 'Shelly', id: 'shelly-7a2c', status: 'online', prev: 3340.2, curr: 3429.0 },
]

export function computeRows(tariff: number = TARIFF, margin: number = MARGIN): ComputedRow[] {
  return DEVICES.map((d) => {
    const kwh = d.curr == null ? null : Math.max(0, +(d.curr - d.prev).toFixed(1))
    const importe = kwh == null ? null : Math.round(kwh * tariff * (1 + margin))
    return { ...d, kwh, importe }
  })
}

export function totals(rows: ComputedRow[]): Totals {
  const valid = rows.filter((r) => r.kwh != null) as Array<
    ComputedRow & { kwh: number; importe: number }
  >
  return {
    kwh: +valid.reduce((s, r) => s + r.kwh, 0).toFixed(1),
    importe: valid.reduce((s, r) => s + r.importe, 0),
    read: valid.length,
    total: rows.length,
    missing: rows.length - valid.length,
  }
}
