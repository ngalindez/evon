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

export async function approvePeriod(input: ApproveInput) {
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

    if (period.status === 'approved' || period.status === 'exported') {
      throw new ApproveError('El período ya fue aprobado')
    }

    const tariff = await tx.tariff.findFirst({
      where: {
        distribuidora: building.distribuidora,
        effectiveFrom: { lte: periodEnd },
      },
      orderBy: { effectiveFrom: 'desc' },
    })
    if (!tariff) {
      throw new ApproveError(`No hay tarifa vigente para ${building.distribuidora}`)
    }

    const price = money(tariff.pricePerKwh.toString())
    const marginRaw = marginOverride?.replace(',', '.') ?? tariff.margin.toString()
    const marginValue = money(marginRaw)
    const onePlusMargin = money(1).plus(marginValue)

    // Drop any partial prior attempt so the second click is idempotent.
    await tx.billingLine.deleteMany({ where: { periodId: period.id } })

    const units = await tx.unit.findMany({
      where: { buildingId },
      include: {
        meterDevices: {
          include: { readings: { where: { periodId: period.id } } },
        },
      },
      orderBy: { label: 'asc' },
    })

    for (const unit of units) {
      // Sum kWh across all devices on the unit, since (rarely) a unit could have more than one.
      const totalKwh = unit.meterDevices.reduce((sum, d) => {
        const r = d.readings[0]
        if (!r) return sum
        return sum.plus(money(r.kwhConsumed.toString()))
      }, ZERO)
      const amount = roundUnitTotal(totalKwh.times(price).times(onePlusMargin))
      await tx.billingLine.create({
        data: {
          periodId: period.id,
          unitId: unit.id,
          kwh: totalKwh.toString(),
          pricePerKwh: price.toString(),
          amount: amount.toString(),
          tariffId: tariff.id,
        },
      })
    }

    const now = new Date()
    const updated = await tx.billingPeriod.update({
      where: { id: period.id },
      data: { status: 'approved', approvedAt: now, processedAt: now },
    })

    return updated
  })
}
