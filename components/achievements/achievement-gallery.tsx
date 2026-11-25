"use client"

import { useMemo, useState } from "react"
import type { Locale } from "@/lib/i18n"
import type { AchievementState, AchievementTier } from "@/lib/achievements/catalog"
import { BadgeCard } from "@/components/achievements/badge-card"

const tiers: { id: AchievementTier; es: string; en: string }[] = [
  { id: "bronce", es: "Bronce", en: "Bronze" },
  { id: "plata", es: "Plata", en: "Silver" },
  { id: "oro", es: "Oro", en: "Gold" },
  { id: "obsidiana", es: "Obsidiana", en: "Obsidian" },
]

export function AchievementGallery({
  states,
  locale = "es",
}: {
  states: AchievementState[]
  locale?: Locale
}) {
  const es = locale === "es"
  const [tier, setTier] = useState<AchievementTier | "todas">("todas")
  const [earnedOnly, setEarnedOnly] = useState(false)

  const visible = useMemo(() => {
    return states.filter((state) => {
      if (tier !== "todas" && state.tier !== tier) return false
      if (earnedOnly && !state.earned) return false
      return true
    })
  }, [states, tier, earnedOnly])

  return (
    <div className="achievement-gallery">
      <div className="badge-controls">
        <div className="badge-filters" role="group" aria-label={es ? "Filtrar por nivel" : "Filter by tier"}>
          <button type="button" aria-pressed={tier === "todas"} onClick={() => setTier("todas")}>
            {es ? "Todas" : "All"} <span>{states.length}</span>
          </button>
          {tiers.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={tier === entry.id}
              onClick={() => setTier(entry.id)}
            >
              {es ? entry.es : entry.en} <span>{states.filter((state) => state.tier === entry.id).length}</span>
            </button>
          ))}
        </div>
        <label className="badge-toggle">
          <input type="checkbox" checked={earnedOnly} onChange={(event) => setEarnedOnly(event.target.checked)} />
          <span>{es ? "Solo obtenidas" : "Earned only"}</span>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="badge-empty">
          {es
            ? "Todavía no hay insignias en este filtro. El progreso se calcula con registros reales de tu cuenta."
            : "No badges in this filter yet. Progress is computed from real records in your account."}
        </p>
      ) : (
        <div className="badge-grid">
          {visible.map((state) => (
            <BadgeCard key={state.id} state={state} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
