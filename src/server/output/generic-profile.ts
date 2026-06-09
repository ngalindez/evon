import type { CsvProfile, ExportLine } from './csv-profile'

/**
 * The generic Export profile — the ONLY profile in the MVP.
 *
 * Columns: unit, concept, amount, detail. Detail is optional, emitted as an empty cell when
 * absent so every row has the same shape.
 *
 * TODO(evon): per-software profiles (Octopus, ConsorcioAbierto, AdminProp, ...) are added as
 * new CsvProfile implementations, not by rewriting this one — see CLAUDE.md "CSV format".
 */
export const genericProfile: CsvProfile = {
  key: 'generic',
  columns: ['unit', 'concept', 'amount', 'detail'],
  toRow(line: ExportLine): string[] {
    return [line.unitRef, line.concept, line.amount, line.detail ?? '']
  },
}
