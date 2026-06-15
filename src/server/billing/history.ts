import type { PeriodStatus } from '@prisma/client'

import { prisma } from '@/infra/db/client'
import { type Money, ZERO, money } from '@/lib/money'

/**
 * Period history listing for /periods/history.
 *
 * Plain English: for each BillingPeriod under the Building, count its readings and (if it has
 * been approved) sum its billing_lines. That gives the listing enough to show kWh + importe at
 * a glance without re-running the pricing engine.
 */

export type HistoryRow = {
  id: string
  year: number
  month: number
  status: PeriodStatus
  approvedAt: Date | null
  readingCount: number
  lineCount: number
  totalKwh: Money
  totalImporte: Money
}

export async function listPeriodHistory(buildingId: string): Promise<HistoryRow[]> {
  const periods = await prisma.billingPeriod.findMany({
    where: { buildingId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      _count: { select: { readings: true, billingLines: true } },
      billingLines: { select: { kwh: true, amount: true } },
    },
  })

  return periods.map((p) => {
    let totalKwh: Money = ZERO
    let totalImporte: Money = ZERO
    for (const l of p.billingLines) {
      totalKwh = totalKwh.plus(money(l.kwh.toString()))
      totalImporte = totalImporte.plus(money(l.amount.toString()))
    }
    return {
      id: p.id,
      year: p.year,
      month: p.month,
      status: p.status,
      approvedAt: p.approvedAt,
      readingCount: p._count.readings,
      lineCount: p._count.billingLines,
      totalKwh,
      totalImporte,
    }
  })
}
