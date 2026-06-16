import type { BillingPeriod, PeriodStatus } from '@prisma/client'

import { prisma } from '@/infra/db/client'

/**
 * Roll back an approval so the administrator can tweak margin and re-approve.
 *
 * Only `approved` periods can be undone. Once exported, the ledger is final.
 */

export class UnapproveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnapproveError'
  }
}

export function assertCanUnapprove(status: PeriodStatus): void {
  if (status === 'exported') {
    throw new UnapproveError('No se puede deshacer: el período ya fue exportado')
  }
  if (status !== 'approved') {
    throw new UnapproveError('El período no está aprobado')
  }
}

export type UnapproveInput = {
  buildingId: string
  year: number
  month: number
}

export type UnapproveResult = {
  period: BillingPeriod
  previousStatus: PeriodStatus
}

export async function unapprovePeriod(input: UnapproveInput): Promise<UnapproveResult> {
  const { buildingId, year, month } = input

  return prisma.$transaction(async (tx) => {
    const period = await tx.billingPeriod.findUnique({
      where: { buildingId_year_month: { buildingId, year, month } },
    })
    if (!period) {
      throw new UnapproveError('No hay período para deshacer')
    }

    const previousStatus = period.status
    assertCanUnapprove(previousStatus)

    await tx.billingLine.deleteMany({ where: { periodId: period.id } })

    const updated = await tx.billingPeriod.update({
      where: { id: period.id },
      data: { status: 'pending_review', approvedAt: null },
    })

    return { period: updated, previousStatus }
  })
}
