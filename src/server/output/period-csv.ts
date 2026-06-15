import { prisma } from '@/infra/db/client'
import { money, roundUnitTotal } from '@/lib/money'
import { generateCsv } from './csv'
import type { ExportLine } from './csv-profile'
import { genericProfile } from './generic-profile'

/**
 * Period-level CSV builder.
 *
 * Plain English: assemble one CSV file for a Billing period. Source priority:
 *   1. If billing_lines exist (the period has been approved), use them — they're the ledger.
 *   2. Otherwise compute on the fly from MeterReadings × the effective Tariff, optionally with
 *      a margin override (the chip selection from the review screen).
 *
 * Returns the filename + body + row count so the route handler can stream it as an attachment.
 */

export type PeriodCsvBuild = {
  filename: string
  body: string
  rowCount: number
  source: 'billing_lines' | 'readings'
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function filenameFor(buildingName: string, year: number, month: number): string {
  return `expensas-${slug(buildingName)}-${year}-${String(month).padStart(2, '0')}.csv`
}

export async function buildCsvForPeriod(
  periodId: string,
  opts?: { marginOverride?: string },
): Promise<PeriodCsvBuild> {
  const period = await prisma.billingPeriod.findUnique({
    where: { id: periodId },
    include: { building: true },
  })
  if (!period) throw new Error(`BillingPeriod ${periodId} not found`)

  const persistedLines = await prisma.billingLine.findMany({
    where: { periodId },
    include: { unit: { select: { label: true, externalRef: true } } },
    orderBy: { unit: { label: 'asc' } },
  })

  let lines: ExportLine[]
  let source: PeriodCsvBuild['source']

  if (persistedLines.length > 0) {
    source = 'billing_lines'
    lines = persistedLines.map((l) => ({
      unitRef: l.unit.externalRef ?? l.unit.label,
      concept: l.concept,
      amount: l.amount.toString(), // already rounded to 2dp on persist
      detail: `${l.kwh.toString()} kWh @ ${l.pricePerKwh.toString()} /kWh`,
    }))
  } else {
    source = 'readings'
    const tariff = await prisma.tariff.findFirst({
      where: {
        distribuidora: period.building.distribuidora,
        effectiveFrom: { lte: period.periodEnd },
      },
      orderBy: { effectiveFrom: 'desc' },
    })
    if (!tariff) {
      throw new Error(`No hay tarifa vigente para ${period.building.distribuidora}`)
    }
    const price = money(tariff.pricePerKwh.toString())
    const marginRaw = opts?.marginOverride
      ? opts.marginOverride.replace(',', '.')
      : tariff.margin.toString()
    const marginValue = money(marginRaw)
    const onePlusMargin = money(1).plus(marginValue)

    const readings = await prisma.meterReading.findMany({
      where: { periodId },
      include: { device: { include: { unit: { select: { label: true, externalRef: true } } } } },
      orderBy: { device: { unit: { label: 'asc' } } },
    })

    lines = readings.map((r) => {
      const kwh = money(r.kwhConsumed.toString())
      const amount = roundUnitTotal(kwh.times(price).times(onePlusMargin))
      return {
        unitRef: r.device.unit.externalRef ?? r.device.unit.label,
        concept: 'Carga vehiculo electrico',
        amount: amount.toString(),
        detail: `${kwh.toString()} kWh @ ${price.toString()} /kWh`,
      }
    })
  }

  return {
    filename: filenameFor(period.building.name, period.year, period.month),
    body: generateCsv(lines, genericProfile),
    rowCount: lines.length,
    source,
  }
}
