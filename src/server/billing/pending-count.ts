import { prisma } from '@/infra/db/client'

/**
 * Billing periods waiting for the administrator to review and approve.
 *
 * MVP: counts across all buildings (auth not wired yet). Once auth ships, scope to the
 * logged-in building admin's portfolio.
 */
export async function countPeriodsPendingReview(): Promise<number> {
  return prisma.billingPeriod.count({
    where: { status: 'pending_review' },
  })
}
