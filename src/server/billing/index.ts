import { NotImplementedError } from '@/lib/errors'

export * from './summary'
export * from './review'

/**
 * Billing: turn a Billing period's Readings into one Billing line per Unit.
 *
 * Plain English: after metering has stored the month's Readings, this aggregates them by Unit,
 * applies the Tariff in effect to the kWh, and writes one charge per Unit — including Units at $0,
 * so the expensas-software import is complete.
 */

/** Produce the Billing lines for a Billing period (one per Unit, including $0). */
export async function buildBillingLines(periodId: string): Promise<void> {
  // TODO(evon): aggregate meter_readings by Unit for this period, look up the effective Tariff
  // (server/tariffs.findEffectiveTariff) per reading, price kWh x price via
  // server/pricing.priceConsumption, and persist one billing_line per Unit in the Building —
  // including Units with zero consumption. See CLAUDE.md "Monthly billing cycle" step 2.
  void periodId
  throw new NotImplementedError('buildBillingLines')
}
