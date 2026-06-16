import type { BillingPeriod, PeriodStatus } from '@prisma/client'

import { prisma } from '@/infra/db/client'
import { ZERO, money, roundUnitTotal } from '@/lib/money'

/**
 * Period approval: turn a month's MeterReadings into persisted BillingLines.
 *
 * Plain English: this is the moment the administrator decides the numbers are right and locks
 * them in. We:
 *   1. Find the BillingPeriod for (Building, Year, Month), creating an `open` one if missing
 *      (auto-open per product decision — keeps the demo flow unblocked).
 *   2. Refuse to re-approve already-approved/exported periods (immutable ledger).
 *   3. Look up the Tariff in effect for the Building's distribuidora.
 *   4. Walk every Unit in the Building (including those without a reading — they get a $0 line,
 *      per CLAUDE.md "including units at $0"). Compute amount = kWh × price × (1 + margin).
 *      Margin override (the chip selection) wins over the Tariff's default.
 *   5. Persist BillingLine rows (wiping any partial prior attempt for the same period) and
 *      transition the period to `approved`.
 *
 * All under a single transaction so a failure mid-way leaves nothing half-written.
 */

export class ApproveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApproveError'
  }
}

export type ApproveInput = {
  buildingId: string
  year: number
  month: number
  /** Margin as a fraction string ("0.08") — falls back to tariff.margin when omitted. */
  marginOverride?: string
}

export type ApproveResult = {
  period: BillingPeriod
  previousStatus: PeriodStatus
}

export async function approvePeriod(input: ApproveInput): Promise<ApproveResult> {
  const { buildingId, year, month, marginOverride } = input

  return prisma.$transaction(async (tx) => {
    const building = await tx.building.findUnique({ where: { id: buildingId } })
    if (!building) throw new ApproveError(`Building ${buildingId} no existe`)

    const periodStart = new Date(Date.UTC(year, month - 1, 1))
    const periodEnd = new Date(Date.UTC(year, month, 1))

    let period = await tx.billingPeriod.findUnique({
      where: { buildingId_year_month: { buildingId, year, month } },
    })
    if (!period) {
      period = await tx.billingPeriod.create({
        data: { buildingId, year, month, status: 'open', periodStart, periodEnd },
      })
    }

    const previousStatus = period.status

    if (period.status === 'approved' || period.status === 'exported') {
      throw new ApproveError('El período ya fue aprobado')
    }

    await tx.billingLine.deleteMany({ where: { periodId: period.id } })

    const [tariff, units, readings, devices] = await Promise.all([
      tx.tariff.findFirst({
        where: {
          distribuidora: building.distribuidora,
          effectiveFrom: { lte: periodEnd },
        },
        orderBy: { effectiveFrom: 'desc' },
      }),
      tx.unit.findMany({ where: { buildingId }, orderBy: { label: 'asc' } }),
      tx.meterReading.findMany({ where: { periodId: period.id } }),
      tx.meterDevice.findMany({
        where: { unit: { buildingId } },
        select: { id: true, unitId: true },
      }),
    ])

    if (!tariff) {
      throw new ApproveError(`No hay tarifa vigente para ${building.distribuidora}`)
    }

    const price = money(tariff.pricePerKwh.toString())
    const marginRaw = marginOverride?.replace(',', '.') ?? tariff.margin.toString()
    const marginValue = money(marginRaw)
    const onePlusMargin = money(1).plus(marginValue)

    const readingByDevice = new Map(readings.map((r) => [r.deviceId, r]))
    const devicesByUnit = new Map<string, string[]>()
    for (const device of devices) {
      const ids = devicesByUnit.get(device.unitId) ?? []
      ids.push(device.id)
      devicesByUnit.set(device.unitId, ids)
    }

    const lines = units.map((unit) => {
      const deviceIds = devicesByUnit.get(unit.id) ?? []
      const totalKwh = deviceIds.reduce((sum, deviceId) => {
        const reading = readingByDevice.get(deviceId)
        if (!reading) return sum
        return sum.plus(money(reading.kwhConsumed.toString()))
      }, ZERO)
      const amount = roundUnitTotal(totalKwh.times(price).times(onePlusMargin))
      return {
        periodId: period.id,
        unitId: unit.id,
        kwh: totalKwh.toString(),
        pricePerKwh: price.toString(),
        amount: amount.toString(),
        tariffId: tariff.id,
      }
    })

    if (lines.length > 0) {
      await tx.billingLine.createMany({ data: lines })
    }

    const now = new Date()
    const updated = await tx.billingPeriod.update({
      where: { id: period.id },
      data: { status: 'approved', approvedAt: now, processedAt: now },
    })

    return { period: updated, previousStatus }
  })
}
