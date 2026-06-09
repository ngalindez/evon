import type { Tariff } from '@prisma/client'

import { prisma } from '@/infra/db/client'

/**
 * Tariffs: look up the per-kWh price in effect for a Distribuidora at a given moment.
 *
 * Plain English: a Tariff is not owned by a Building — it belongs to the Distribuidora (EDESUR /
 * EDENOR) and applies from an effective date onward. To bill a Reading we want the most recent
 * Tariff whose effective date is on or before the reading's instant.
 */

/** The Tariff in effect for `distribuidora` at instant `at`, or null if none applies yet. */
export function findEffectiveTariff(distribuidora: string, at: Date): Promise<Tariff | null> {
  return prisma.tariff.findFirst({
    where: {
      distribuidora,
      effectiveFrom: { lte: at },
    },
    orderBy: { effectiveFrom: 'desc' },
  })
}

// TODO(evon): VAT / surcharges / fixed charge and the source of the tariff tables, once the
// detailed tariff rules are confirmed — see CLAUDE.md "TODO / open questions: Detailed tariff
// rules". For now a Tariff is a single per-kWh price with an effective date.
