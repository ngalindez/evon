import type { CsvProfile, ExportLine } from './csv-profile'

/**
 * Escape one CSV cell per RFC 4180: if the value contains a comma, double-quote, or newline,
 * wrap it in double quotes and double any internal quotes. Otherwise return it unchanged.
 */
function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Join one row's cells with commas, escaping each cell. */
function toCsvRow(cells: string[]): string {
  return cells.map(escapeCell).join(',')
}

/**
 * Serialize export lines to a CSV string using the given Export profile.
 *
 * First row is the profile's header (`profile.columns`); each subsequent row is
 * `profile.toRow(line)`. Rows are joined with '\n'.
 */
export function generateCsv(lines: ExportLine[], profile: CsvProfile): string {
  const rows: string[] = [toCsvRow(profile.columns)]
  for (const line of lines) {
    rows.push(toCsvRow(profile.toRow(line)))
  }
  return rows.join('\n')
}
