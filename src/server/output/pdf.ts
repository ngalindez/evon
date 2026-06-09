import { NotImplementedError } from '@/lib/errors'

/**
 * Inputs for a per-Unit detail PDF: which Building and Unit, the Billing period label, and the
 * billed kWh + amount (both as exact strings, never floats).
 */
export interface UnitPdfInput {
  buildingName: string
  unitLabel: string
  periodLabel: string
  kwh: string
  amount: string
}

/**
 * Render the per-Unit detail PDF for a Billing period.
 *
 * TODO(evon): choose a PDF library — NOT part of the CLAUDE.md stack, so it must be approved
 * before adding — and render the per-Unit detail document. Stubbed for now.
 */
export async function generateUnitPdf(input: UnitPdfInput): Promise<Uint8Array> {
  void input
  throw new NotImplementedError('generateUnitPdf')
}
