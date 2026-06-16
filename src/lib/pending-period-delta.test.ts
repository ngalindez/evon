import { describe, expect, it } from 'vitest'
import { pendingPeriodCountDelta } from './pending-period-delta'

describe('pendingPeriodCountDelta', () => {
  it('decrements when a pending review is approved', () => {
    expect(pendingPeriodCountDelta('pending_review', 'approved')).toBe(-1)
  })

  it('increments when approval is undone', () => {
    expect(pendingPeriodCountDelta('approved', 'pending_review')).toBe(1)
  })

  it('stays unchanged when approving from open', () => {
    expect(pendingPeriodCountDelta('open', 'approved')).toBe(0)
  })
})
