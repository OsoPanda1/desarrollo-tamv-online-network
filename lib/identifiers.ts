export function normalizeOrcid(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?orcid\.org\//i, "")
    .replaceAll(" ", "")
    .toUpperCase()
}

export function isValidOrcid(value: string) {
  const normalized = normalizeOrcid(value)
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(normalized)) return false
  const digits = normalized.replaceAll("-", "")
  let total = 0
  for (const digit of digits.slice(0, 15)) total = (total + Number(digit)) * 2
  const check = (12 - (total % 11)) % 11
  const expected = check === 10 ? "X" : String(check)
  return digits[15] === expected
}

export function normalizeIsni(value: string) {
  return value.trim().replaceAll(" ", "").toUpperCase()
}

export function hasIsniFormat(value: string) {
  return /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(normalizeIsni(value))
}
