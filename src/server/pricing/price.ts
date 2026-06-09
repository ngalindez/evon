import { type Money, money, roundUnitTotal } from '@/lib/money'

/**
 * Inputs for pricing one Unit's consumption.
 *
 * Plain English: how many kWh the Unit used, the per-kWh price from the Tariff in effect,
 * and an optional margin expressed as a fraction (0.10 = +10%). MVP runs with margin 0.
 */
export interface PricingInput {
  kwh: Money
  pricePerKwh: Money
  /** Margin as a fraction of gross (e.g. 0.10 for +10%). Defaults to 0. */
  margin?: Money
}

/**
 * Compute the amount to bill for one Unit's consumption.
 *
 * gross = kwh x pricePerKwh; then apply margin as a fraction (gross x (1 + margin)).
 * Only the final per-Unit total is rounded (2 decimals, half-up) — intermediate math
 * stays at full precision (see CLAUDE.md "Rounding").
 *
 * TODO(evon): VAT / surcharges / fixed charge + exact margin semantics are provisional —
 * see CLAUDE.md "Detailed tariff rules". MVP: importe = kWh x precio_kwh, margin = 0.
 */
export function priceConsumption(input: PricingInput): Money {
  const margin = input.margin ?? money(0)
  const gross = input.kwh.times(input.pricePerKwh)
  const withMargin = gross.times(money(1).plus(margin))
  return roundUnitTotal(withMargin)
}
