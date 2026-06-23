import type { PeriodStatus } from '@prisma/client'

/** Sidebar badge delta after a period status transition. */
export function pendingPeriodCountDelta(before: PeriodStatus | null, after: PeriodStatus): number {
  if (before === 'pending_review' && after === 'approved') return -1
  if (before === 'approved' && after === 'pending_review') return 1
  return 0
}
