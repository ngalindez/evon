import type { PeriodStatus } from '@prisma/client'

import { prisma } from '@/infra/db/client'
import { ACTIVE_PERIOD_COOKIE } from '@/server/active/constants'

/**
 * Period picker helpers.
 *
 * Plain English: the topbar lets the admin jump between BillingPeriods for a Building. We
 * always include the current calendar month (even when no DB row exists yet, so the admin can
 * approve "this month" from scratch). Past periods come from the BillingPeriod table.
 */

export type PickerPeriod = {
  year: number
  month: number
  status: PeriodStatus | null
}

/** Read the cookie selection, falling back to the current calendar month. */
export async function getActivePeriod(): Promise<{ year: number; month: number }> {
  const { cookies } = await import('next/headers')
  let raw: string | undefined
  try {
    raw = (await cookies()).get(ACTIVE_PERIOD_COOKIE)?.value
  } catch {
    raw = undefined
  }
  if (raw && /^\d{4}-\d{1,2}$/.test(raw)) {
    const [y, m] = raw.split('-')
    return { year: Number.parseInt(y, 10), month: Number.parseInt(m, 10) }
  }
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 }
}

/** All periods for a Building (newest first), plus the current month if it's missing. */
export async function listPeriodsForPicker(buildingId: string): Promise<PickerPeriod[]> {
  const periods = await prisma.billingPeriod.findMany({
    where: { buildingId },
    select: { year: true, month: true, status: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  const now = new Date()
  const curYear = now.getUTCFullYear()
  const curMonth = now.getUTCMonth() + 1
  const hasCurrent = periods.some((p) => p.year === curYear && p.month === curMonth)

  const list: PickerPeriod[] = periods.map((p) => ({
    year: p.year,
    month: p.month,
    status: p.status,
  }))
  if (!hasCurrent) {
    list.unshift({ year: curYear, month: curMonth, status: null })
  }
  return list
}
