import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PageIntro } from "@/components/shared/page-intro"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { AchievementGallery } from "@/components/achievements/achievement-gallery"
import { AchievementSummary } from "@/components/achievements/achievement-summary"
import { auth } from "@/lib/auth"
import { getAchievementView } from "@/lib/achievements/view"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Achievements and badges",
        description: "Twenty badges awarded only for verifiable records: proposals, evidence, reviews, HCU work, learning, and consent.",
      }
    : {
        title: "Logros e insignias",
        description: "Veinte insignias otorgadas solo por registros verificables: propuestas, evidencia, revisión, trabajo HCU, formación y consentimiento.",
      }
}

export default async function AchievementsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const es = locale === "es"
  const session = await auth.api.getSession({ headers: await headers() })
  const view = await getAchievementView(session?.user?.id ?? null)

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="22"
        eyebrow={es ? "LOGROS E INSIGNIAS" : "ACHIEVEMENTS & BADGES"}
        title={es ? "Veinte insignias." : "Twenty badges."}
        accent={es ? "Cero atajos." : "Zero shortcuts."}
        description={
          es
            ? "Un sistema de reconocimiento calculado con hechos que la aplicación puede observar. Sin insignias por visitar, por preguntar a un modelo o por una afirmación no verificable."
            : "A recognition system computed from facts the application can observe. No badges for visiting, for asking a model, or for an unverifiable claim."
        }
        locale={locale}
        actions={<LanguageSwitch pathname="/logros" locale={locale} />}
      />

      <section className="section achievements-section">
        <div className="container">
          <AchievementSummary view={view} locale={locale} />
          <AchievementGallery states={view.states} locale={locale} />
        </div>
      </section>

      <section className="section achievements-section achievements-rules">
        <div className="container achievements-rules-inner">
          <div>
            <p className="eyebrow">{es ? "REGLAS DEL SISTEMA" : "SYSTEM RULES"}</p>
            <h2>{es ? "Cómo se gana una insignia" : "How a badge is earned"}</h2>
            <ul>
              <li>
                <strong>{es ? "Hecho observable" : "Observable fact"}</strong>
                <span>
                  {es
                    ? "Cada insignia apunta a un recuento de registros propios: propuestas, evidencias, revisiones, átomos HCU, módulos o consentimiento."
                    : "Each badge points to a count of your own records: proposals, evidence, reviews, HCU atoms, modules, or consent."}
                </span>
              </li>
              <li>
                <strong>{es ? "Sin contenido personal" : "No personal content"}</strong>
                <span>
                  {es
                    ? "El cálculo usa agregados y banderas. No expone títulos, textos ni datos de otras personas."
                    : "The computation uses aggregates and flags. It exposes no titles, texts, or other people's data."}
                </span>
              </li>
              <li>
                <strong>{es ? "Degradación honesta" : "Honest degradation"}</strong>
                <span>
                  {es
                    ? "Si la base de datos no responde, la página muestra el catálogo sin inventar progreso."
                    : "If the database does not respond, the page shows the catalogue without inventing progress."}
                </span>
              </li>
              <li>
                <strong>{es ? "Sin acreditación implícita" : "No implied accreditation"}</strong>
                <span>
                  {es
                    ? "Las insignias reconocen actividad en TAMV. No equivalen a un título, una certificación oficial ni una revisión por pares."
                    : "Badges recognise activity within TAMV. They are not a degree, an official certification, or peer review."}
                </span>
              </li>
            </ul>
          </div>
          <aside className="achievements-cta">
            <h3>{es ? "Empieza por una acción real" : "Start with one real action"}</h3>
            <p>
              {es
                ? "Registra una propuesta, adjunta evidencia o completa el primer módulo. La insignia aparece cuando el registro existe."
                : "Submit a proposal, attach evidence, or complete the first module. The badge appears when the record exists."}
            </p>
            <Link href={`/investigacion?lang=${locale}`}>{es ? "Ir a investigación" : "Go to research"} →</Link>
            <Link href={`/formacion?lang=${locale}`}>{es ? "Ir a formación" : "Go to learning"} →</Link>
            <Link href={`/membresias?lang=${locale}`}>{es ? "Ver membresías" : "View memberships"} →</Link>
          </aside>
        </div>
      </section>
    </TamvAppShell>
  )
}
