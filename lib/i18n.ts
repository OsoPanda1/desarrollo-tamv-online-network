export type Locale = "es" | "en"

export function resolveLocale(value?: string | string[]): Locale {
  return value === "en" ? "en" : "es"
}

export function localizedPath(path: string, locale: Locale) {
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`
}

export function projectCategoryLabel(category: string, locale: Locale) {
  const labels: Record<string, [string, string]> = {
    architecture: ["Arquitectura", "Architecture"],
    ai: ["Inteligencia artificial", "Artificial intelligence"],
    academia: ["Academia", "Academia"],
    territory: ["Territorio", "Place & community"],
  }
  const pair = labels[category] ?? [category, category]
  return pair[locale === "es" ? 0 : 1]
}
