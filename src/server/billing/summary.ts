import type { BillingPeriod, Tariff } from '@prisma/client'

import { prisma } from '@/infra/db/client'
import { type Money, ZERO, money, roundUnitTotal } from '@/lib/money'
import { type DeviceRow, listDeviceRows } from '@/server/catalog'
import { findEffectiveTariff } from '@/server/tariffs'

/**
 * Dashboard summary: everything the /dashboard screen needs for one Building, derived from
 * Prisma in a single server-side call.
 *
 * Plain English: pick the current calendar-month BillingPeriod for the Building (or null if not
 * opened yet), join in the Reading each device has for that period, look up the tariff in
 * effect, then compute the headline numbers — total kWh, total importe, devices with reading,
 * devices missing reading.
 */

export type DashboardDeviceRow = DeviceRow & {
  /** kWh in the active period — null when no reading has been persisted yet for this device. */
  kwh: Money | null
  /** Per-unit importe = kwh * pricePerKwh * (1 + margin). Null when kwh is null. */
  importe: Money | null
}

export type DashboardSummary = {
  period: BillingPeriod | null
  tariff: Tariff | null
  rows: DashboardDeviceRow[]
  totals: {
    kwh: Money
    importe: Money
    read: number
    total: number
    missing: number
  }
}

export async function getDashboardSummary(
  buildingId: string,
  now: Date = new Date(),
): Promise<DashboardSummary> {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1

  const [period, tariff, devices] = await Promise.all([
    prisma.billingPeriod.findUnique({
      where: { buildingId_year_month: { buildingId, year, month } },
    }),
    // Tariff lookup requires the Building's distribuidora — load it via the same trip.
    prisma.building
      .findUnique({ where: { id: buildingId }, select: { distribuidora: true } })
      .then((b) => (b ? findEffectiveTariff(b.distribuidora, now) : null)),
    listDeviceRows(buildingId, now),
  ])

  const periodReadings = period
    ? await prisma.meterReading.findMany({
        where: { periodId: period.id },
        select: { deviceId: true, kwhConsumed: true },
      })
    : []
  const kwhByDevice = new Map<string, Money>(
    periodReadings.map((r) => [r.deviceId, money(r.kwhConsumed.toString())]),
  )

  const pricePerKwh = tariff ? money(tariff.pricePerKwh.toString()) : null
  const margin = tariff ? money(tariff.margin.toString()) : money(0)
  const onePlusMargin = money(1).plus(margin)

  const rows: DashboardDeviceRow[] = devices.map((d) => {
    const kwh = kwhByDevice.get(d.id) ?? null
    const importe =
      kwh && pricePerKwh ? roundUnitTotal(kwh.times(pricePerKwh).times(onePlusMargin)) : null
    return { ...d, kwh, importe }
  })

  let totalKwh = ZERO
  let totalImporte = ZERO
  let read = 0
  for (const r of rows) {
    if (r.kwh != null) {
      totalKwh = totalKwh.plus(r.kwh)
      read += 1
      if (r.importe != null) totalImporte = totalImporte.plus(r.importe)
    }
  }

  return {
    period,
    tariff,
    rows,
    totals: {
      kwh: totalKwh,
      importe: totalImporte,
      read,
      total: rows.length,
      missing: rows.length - read,
    },
  }
}
