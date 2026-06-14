import type { BillingPeriod, Building, Tariff } from '@prisma/client'

import { prisma } from '@/infra/db/client'
import { findEffectiveTariff } from '@/server/tariffs'

/**
 * Period review: everything the /periods CSV-review screen needs for one Building's current
 * month, joined to plain JSON so it can cross the server/client boundary (Prisma `Decimal`
 * values become strings).
 *
 * Plain English: each row in the review table is one Unit. We carry the kWh and the cumulative
 * counter snapshots (if the breaker reports them) so the table can show "Lectura inicial /
 * final" alongside the period consumption.
 */

export type PeriodReviewRow = {
  /** MeterDevice id (also used as React key). */
  deviceId: string
  /** Unit label, e.g. "3.º B". */
  uf: string
  /** Cloud-side device id, e.g. "shelly-1a2b". */
  providerDeviceId: string
  /** kWh consumed in the period — string-encoded decimal, or null if no reading yet. */
  kwh: string | null
  /** Cumulative counter at the start of the period, if the breaker reports it. */
  counterStart: string | null
  /** Cumulative counter at the end of the period, if the breaker reports it. */
  counterEnd: string | null
}

export type PeriodReview = {
  building: { id: string; name: string; distribuidora: string }
  period: {
    id: string
    year: number
    month: number
    status: BillingPeriod['status']
    periodStart: string
    periodEnd: string
  } | null
  tariff: {
    id: string
    pricePerKwh: string
    margin: string
    distribuidora: string
  } | null
  rows: PeriodReviewRow[]
  totals: {
    total: number
    withReading: number
    missing: number
  }
}

function toPlainBuilding(b: Building) {
  return { id: b.id, name: b.name, distribuidora: b.distribuidora }
}

function toPlainPeriod(p: BillingPeriod): PeriodReview['period'] {
  return {
    id: p.id,
    year: p.year,
    month: p.month,
    status: p.status,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
  }
}

function toPlainTariff(t: Tariff): PeriodReview['tariff'] {
  return {
    id: t.id,
    pricePerKwh: t.pricePerKwh.toString(),
    margin: t.margin.toString(),
    distribuidora: t.distribuidora,
  }
}

/**
 * Load all data needed to render /periods for one Building's calendar month.
 *
 * No-period and no-reading cases are returned as nulls / empty fields — the page renders the
 * appropriate empty state.
 */
export async function getPeriodReview(
  buildingId: string,
  now: Date = new Date(),
): Promise<PeriodReview> {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1

  const building = await prisma.building.findUnique({ where: { id: buildingId } })
  if (!building) throw new Error(`Building ${buildingId} not found`)

  const [period, devices, tariff] = await Promise.all([
    prisma.billingPeriod.findUnique({
      where: { buildingId_year_month: { buildingId, year, month } },
    }),
    prisma.meterDevice.findMany({
      where: { unit: { buildingId } },
      include: {
        unit: { select: { label: true } },
      },
      orderBy: [{ unit: { label: 'asc' } }],
    }),
    findEffectiveTariff(building.distribuidora, now),
  ])

  const readingsByDevice = period
    ? new Map(
        (
          await prisma.meterReading.findMany({
            where: { periodId: period.id },
            select: {
              deviceId: true,
              kwhConsumed: true,
              counterStart: true,
              counterEnd: true,
            },
          })
        ).map((r) => [r.deviceId, r]),
      )
    : new Map()

  const rows: PeriodReviewRow[] = devices.map((d) => {
    const r = readingsByDevice.get(d.id)
    return {
      deviceId: d.id,
      uf: d.unit.label,
      providerDeviceId: d.providerDeviceId,
      kwh: r ? r.kwhConsumed.toString() : null,
      counterStart: r?.counterStart ? r.counterStart.toString() : null,
      counterEnd: r?.counterEnd ? r.counterEnd.toString() : null,
    }
  })

  const withReading = rows.filter((r) => r.kwh != null).length

  return {
    building: toPlainBuilding(building),
    period: period ? toPlainPeriod(period) : null,
    tariff: tariff ? toPlainTariff(tariff) : null,
    rows,
    totals: {
      total: rows.length,
      withReading,
      missing: rows.length - withReading,
    },
  }
}
