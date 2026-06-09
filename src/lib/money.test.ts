import { money, roundKwh, roundUnitTotal } from '@/lib/money'
import { describe, expect, it } from 'vitest'

describe('money', () => {
  it('rounds the per-unit total half-up to 2 decimals', () => {
    expect(roundUnitTotal(money('1.005')).toString()).toBe('1.01')
    expect(roundUnitTotal(money('2.344')).toString()).toBe('2.34')
  })

  it('rounds kWh to 3 decimals half-up', () => {
    expect(roundKwh(money('1.2345')).toString()).toBe('1.235')
  })

  it('uses exact decimal arithmetic (never float)', () => {
    expect(money('0.1').plus(money('0.2')).toString()).toBe('0.3')
  })
})
