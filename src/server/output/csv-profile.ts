/**
 * One row of data destined for a Building admin's expensas software, before it is laid out by
 * a specific Export profile.
 *
 * Plain English: a single per-Unit charge to export — which Unit, what concept, the amount as
 * a string (money stays exact, never a float), and an optional human-readable detail.
 */
export interface ExportLine {
  unitRef: string
  concept: string
  amount: string
  detail?: string
}

/**
 * An Export profile: the CSV layout for one expensas software.
 *
 * `columns` is the header row; `toRow` maps one ExportLine to that profile's cell order.
 * The MVP ships only the generic profile.
 */
export interface CsvProfile {
  key: string
  columns: string[]
  toRow(line: ExportLine): string[]
}
