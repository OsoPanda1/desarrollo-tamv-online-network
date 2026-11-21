export function csvCell(value: unknown): string {
  const raw = value == null ? "" : String(value)
  // Prefix spreadsheet formula starters, including those preceded by control/space
  // characters, so exported user-controlled text is not evaluated as a formula.
  const safe = /^[\u0000-\u0020]*[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replaceAll('"', '""')}"`
}
