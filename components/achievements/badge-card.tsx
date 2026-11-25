import type { Locale } from "@/lib/i18n"
import type { AchievementState } from "@/lib/achievements/catalog"

const tierNames = {
  bronce: { es: "Bronce", en: "Bronze" },
  plata: { es: "Plata", en: "Silver" },
  oro: { es: "Oro", en: "Gold" },
  obsidiana: { es: "Obsidiana", en: "Obsidian" },
} as const

export function BadgeCard({ state, locale = "es" }: { state: AchievementState; locale?: Locale }) {
  const es = locale === "es"
  const name = es ? state.nameEs : state.nameEn
  const description = es ? state.descriptionEs : state.descriptionEn
  const criterion = es ? state.criterionEs : state.criterionEn
  const tier = tierNames[state.tier][locale]
  const percent = Math.round(state.progress * 100)

  return (
    <article
      className={`badge-card tier-${state.tier} ${state.earned ? "is-earned" : "is-locked"}`}
      aria-label={`${name}. ${state.earned ? (es ? "Obtenida" : "Earned") : es ? "Pendiente" : "Pending"}. ${percent}%`}
    >
      <div className="badge-medal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/visuals/badges/${state.badge}.svg`} alt="" width={512} height={512} loading="lazy" decoding="async" />
        {!state.earned && (
          <span className="badge-lock" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        )}
      </div>
      <div className="badge-body">
        <div className="badge-top">
          <span className="badge-code">{state.code}</span>
          <span className="badge-tier">{tier}</span>
        </div>
        <h3>{name}</h3>
        <p className="badge-description">{description}</p>
        <div
          className="badge-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={state.target}
          aria-valuenow={state.current}
          aria-label={es ? `Progreso de ${name}` : `Progress for ${name}`}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="badge-meta">
          <span>
            {state.current} / {state.target}
          </span>
          <span>{state.xp} XP</span>
        </div>
        <p className="badge-criterion">
          <span aria-hidden="true">✦</span> {criterion}
        </p>
      </div>
    </article>
  )
}
