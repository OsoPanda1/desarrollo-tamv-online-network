import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import type { AchievementView } from "@/lib/achievements/view"

export function AchievementSummary({ view, locale = "es" }: { view: AchievementView; locale?: Locale }) {
  const es = locale === "es"
  const level = es ? view.level.current.nameEs : view.level.current.nameEn
  const next = view.level.next ? (es ? view.level.next.nameEs : view.level.next.nameEn) : null
  const percent = Math.round(view.level.progress * 100)

  return (
    <div className="achievement-summary">
      <div className="achievement-summary-main">
        <p className="eyebrow">{es ? "TU RECORRIDO" : "YOUR JOURNEY"}</p>
        <div className="achievement-level">
          <span className="achievement-level-name">{level}</span>
          <span className="achievement-level-xp">{view.experience} XP</span>
        </div>
        <div className="achievement-level-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={es ? "Progreso al siguiente nivel" : "Progress to the next level"}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="achievement-level-note">
          {next
            ? es
              ? `${percent}% hacia ${next}. El XP solo proviene de insignias obtenidas.`
              : `${percent}% toward ${next}. XP only comes from earned badges.`
            : es
              ? "Nivel máximo alcanzado. El XP solo proviene de insignias obtenidas."
              : "Highest level reached. XP only comes from earned badges."}
        </p>
      </div>
      <div className="achievement-summary-count">
        <strong>
          {view.earned}
          <span>/{view.total}</span>
        </strong>
        <span>{es ? "insignias obtenidas" : "badges earned"}</span>
      </div>
      <div className="achievement-summary-actions">
        {view.authenticated ? (
          <Link href={`/cuenta?lang=${locale}`}>{es ? "Ver mi cuenta" : "View my account"} →</Link>
        ) : (
          <>
            <Link href={`/sign-in?lang=${locale}`}>{es ? "Iniciar sesión" : "Sign in"} →</Link>
            <Link href={`/unete?lang=${locale}`}>{es ? "Crear cuenta" : "Create account"}</Link>
          </>
        )}
      </div>
      {view.degraded && (
        <p className="achievement-degraded" role="status">
          {es
            ? "No se pudo leer tu progreso en este momento. Mostramos el catálogo sin inventar avances."
            : "Your progress could not be read right now. We show the catalogue without inventing progress."}
        </p>
      )}
      {!view.authenticated && (
        <p className="achievement-guest">
          {es
            ? "Estás viendo el catálogo público. Al iniciar sesión, cada insignia muestra tu avance real."
            : "You are viewing the public catalogue. After signing in, each badge shows your real progress."}
        </p>
      )}
    </div>
  )
}
