import { money } from '@/lib/money'
import { describe, expect, it } from 'vitest'
import { type CounterSample, computeUsageSeries } from './index'

// Noon UTC stays on the same calendar day in ART (UTC-3), so these map 1:1 to their date.
function sample(counter: number, iso: string): CounterSample {
  return { counterKwh: money(counter), readAt: new Date(iso) }
}

describe('computeUsageSeries', () => {
  it('returns nothing with fewer than two samples', () => {
    expect(computeUsageSeries([], 'day')).toEqual([])
    expect(computeUsageSeries([sample(5, '2026-06-23T12:00:00Z')], 'day')).toEqual([])
  })

  it('buckets adjacent deltas by the later sample day', () => {
    const series = computeUsageSeries(
      [
        sample(0, '2026-06-21T12:00:00Z'),
        sample(2, '2026-06-22T12:00:00Z'),
        sample(5, '2026-06-23T12:00:00Z'),
      ],
      'day',
    )
    expect(series.map((b) => [b.key, b.kwh])).toEqual([
      ['2026-06-22', 2],
      ['2026-06-23', 3],
    ])
  })

  it('treats a counter drop as a reset (counts the new value, never negative)', () => {
    const series = computeUsageSeries(
      [sample(10, '2026-06-22T12:00:00Z'), sample(3, '2026-06-23T12:00:00Z')],
      'day',
    )
    expect(series).toEqual([{ key: '2026-06-23', label: '23/06', kwh: 3 }])
  })

  it('sums multiple deltas that fall in the same bucket', () => {
    const series = computeUsageSeries(
      [
        sample(0, '2026-06-23T08:00:00Z'),
        sample(1, '2026-06-23T12:00:00Z'),
        sample(4, '2026-06-23T16:00:00Z'),
      ],
      'day',
    )
    expect(series).toEqual([{ key: '2026-06-23', label: '23/06', kwh: 4 }])
  })

  it('aggregates by month', () => {
    const series = computeUsageSeries(
      [sample(0, '2026-05-15T12:00:00Z'), sample(10, '2026-06-15T12:00:00Z')],
      'month',
    )
    expect(series).toEqual([{ key: '2026-06', label: '06/26', kwh: 10 }])
  })
})
