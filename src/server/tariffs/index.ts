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

/** Input shape for create/update of a Tariff. Decimals are passed as strings. */
export type TariffInput = {
  distribuidora: string
  pricePerKwh: string
  margin: string
  effectiveFrom: Date
}

/** All Tariffs sorted by effective date (newest first). */
export function listTariffs() {
  return prisma.tariff.findMany({
    orderBy: [{ effectiveFrom: 'desc' }, { distribuidora: 'asc' }],
  })
}

/** Find one Tariff by id. Returns null if not found. */
export function getTariff(id: string) {
  return prisma.tariff.findUnique({ where: { id } })
}

/** Create a Tariff. */
export function createTariff(input: TariffInput) {
  return prisma.tariff.create({
    data: {
      distribuidora: input.distribuidora,
      pricePerKwh: input.pricePerKwh,
      margin: input.margin,
      effectiveFrom: input.effectiveFrom,
    },
  })
}

/** Update an existing Tariff. */
export function updateTariff(id: string, input: TariffInput) {
  return prisma.tariff.update({
    where: { id },
    data: {
      distribuidora: input.distribuidora,
      pricePerKwh: input.pricePerKwh,
      margin: input.margin,
      effectiveFrom: input.effectiveFrom,
    },
  })
}

/** Delete a Tariff. BillingLine.tariff has onDelete:SetNull so historical lines survive. */
export function deleteTariff(id: string) {
  return prisma.tariff.delete({ where: { id } })
}

// TODO(evon): VAT / surcharges / fixed charge and the source of the tariff tables, once the
// detailed tariff rules are confirmed — see CLAUDE.md "TODO / open questions: Detailed tariff
// rules". For now a Tariff is a single per-kWh price with an effective date.
