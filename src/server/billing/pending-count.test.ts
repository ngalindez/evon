import { beforeEach, describe, expect, it, vi } from 'vitest'
import { countPeriodsPendingReview } from './pending-count'

const { countMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
}))

vi.mock('@/infra/db/client', () => ({
  prisma: {
    billingPeriod: { count: countMock },
  },
}))

describe('countPeriodsPendingReview', () => {
  beforeEach(() => {
    countMock.mockReset()
  })

  it('counts only periods in pending_review', async () => {
    countMock.mockResolvedValue(2)

    await expect(countPeriodsPendingReview()).resolves.toBe(2)
    expect(countMock).toHaveBeenCalledWith({
      where: { status: 'pending_review' },
    })
  })
})
