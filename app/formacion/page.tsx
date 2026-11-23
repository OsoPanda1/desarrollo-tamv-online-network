import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { ArrowLeft, ArrowUpRight, BookOpenCheck, CheckCircle2, FileText, Lightbulb, ShieldCheck, Target } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { PageIntro } from "@/components/shared/page-intro"
import { MembershipCheckout } from "@/components/membership-checkout"
import { MemberCourseProgress } from "@/components/member-course-progress"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { memberCourseProgress, membershipSubscriptions } from "@/lib/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { COURSE_MODULE_IDS, COURSE_SLUG } from "@/lib/billing/plans"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>
export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Developer profile and investor pitch course", description: "A five-module practical learning path for professional identity, evidence-based portfolio, startup validation, business model, and investor pitch." }
    : { title: "Curso de perfil de desarrollador y pitch para inversión", description: "Ruta formativa práctica de cinco módulos: identidad profesional, portafolio con evidencia, validación de startup, modelo de negocio y presentación para inversionistas." }
}

const modules = [
  {
    id: COURSE_MODULE_IDS[0],
    number: "01",
    title: "Construye un perfil profesional verificable",
    titleEn: "Build a verifiable professional profile",
    goal: "Explicar quién eres, qué problema trabajas, cuál es tu aporte y cómo pueden verificarlo otras personas.",
    goalEn: "Explain who you are, what problem you work on, what you contribute, and how others can verify it.",
    lesson: [
      "Redacta una propuesta de valor en 2–3 frases: perfil, especialidad, problema y resultado demostrable.",
      "Separa experiencia, aprendizaje, contribución voluntaria y credenciales formales. No presentes cursos o prototipos como títulos académicos.",
      "Vincula identificadores persistentes y perfiles públicos solo cuando estén bajo tu control y se puedan comprobar.",
    ],
    lessonEn: [
      "Write a two- or three-sentence value proposition: profile, specialty, problem, and demonstrated outcome.",
      "Separate work experience, learning, volunteer contributions, and formal credentials. Do not present courses or prototypes as academic degrees.",
      "Link persistent identifiers and public profiles only when you control them and they can be verified.",
    ],
    deliverable: "Biografía de 120 palabras + especialidad + problema que resuelves + tres evidencias verificables.",
    deliverableEn: "A 120-word bio + specialty + problem solved + three verifiable pieces of evidence.",
    check: "¿Puede alguien entender tu aporte en 30 segundos y comprobar al menos una evidencia?",
    checkEn: "Can someone understand your contribution in 30 seconds and verify at least one piece of evidence?",
  },
  {
    id: COURSE_MODULE_IDS[1],
    number: "02",
    title: "Construye un portafolio que pueda auditarse",
    titleEn: "Build an auditable portfolio",
    goal: "Convertir repositorios, prototipos y documentación en evidencia comprensible, reproducible y honesta.",
    goalEn: "Turn repositories, prototypes, and documentation into understandable, reproducible, honest evidence.",
    lesson: [
      "Cada proyecto necesita propósito, problema, estado real (idea, prototipo, alfa, beta o producción), tecnologías y límites conocidos.",
      "Incluye README con instalación, configuración por variables de entorno, pruebas ejecutadas y resultados reproducibles.",
      "Registra autoría, licencia, dependencias, fuentes, decisiones, deuda técnica y riesgos; nunca publiques claves ni datos personales de terceros.",
    ],
    lessonEn: [
      "Each project needs a purpose, problem, actual status (idea, prototype, alpha, beta, or production), technologies, and known limits.",
      "Include a README with installation, environment configuration, tests run, and reproducible results.",
      "Record authorship, licensing, dependencies, sources, decisions, technical debt and risks; never publish secrets or third-party personal data.",
    ],
    deliverable: "README breve, un diagrama de arquitectura y una lista de pruebas con evidencia real.",
    deliverableEn: "A concise README, one architecture diagram, and a test list backed by real evidence.",
    check: "¿Puede otra persona clonar o abrir el proyecto y reproducir el resultado documentado?",
    checkEn: "Can another person open the project and reproduce the documented result?",
  },
  {
    id: COURSE_MODULE_IDS[2],
    number: "03",
    title: "Valida el problema y la startup",
    titleEn: "Validate the problem and startup",
    goal: "Mostrar que la iniciativa parte de un problema concreto y no solo de una tecnología atractiva.",
    goalEn: "Show that the venture starts from a concrete problem, not merely attractive technology.",
    lesson: [
      "Define usuario, necesidad, contexto y costo del problema con una hipótesis que pueda refutarse.",
      "Realiza entrevistas o pruebas con consentimiento. Separa comentarios anecdóticos, evidencia observada y métricas.",
      "Mapea alternativas existentes, restricciones de adopción y una prueba mínima para reducir la incertidumbre principal.",
    ],
    lessonEn: [
      "Define the user, need, context, and cost of the problem with a falsifiable hypothesis.",
      "Run interviews or tests with consent. Separate anecdotes, observed evidence, and metrics.",
      "Map existing alternatives, adoption constraints, and a minimal experiment that reduces the main uncertainty.",
    ],
    deliverable: "Hipótesis del problema, perfil de cliente inicial, cinco preguntas de entrevista y una prueba de validación.",
    deliverableEn: "Problem hypothesis, first customer profile, five interview questions, and one validation experiment.",
    check: "¿Qué resultado concreto haría que cambiaras de hipótesis o dejaras de construir?",
    checkEn: "What specific result would make you change your hypothesis or stop building?",
  },
  {
    id: COURSE_MODULE_IDS[3],
    number: "04",
    title: "Explica el modelo de negocio y el plan de ejecución",
    titleEn: "Explain the business model and execution plan",
    goal: "Conectar el producto con usuarios, distribución, costos, ingresos, métricas y riesgos.",
    goalEn: "Connect the product to users, distribution, costs, revenue, metrics, and risks.",
    lesson: [
      "Describe quién usa, quién decide, quién paga y por qué cambiaría de una alternativa actual.",
      "Presenta costos fijos y variables, precio o modelo de ingresos, supuestos, margen y horizonte de caja como hipótesis verificables.",
      "Prioriza tres hitos medibles para 90 días, responsables, dependencias y un registro de riesgos con mitigaciones.",
    ],
    lessonEn: [
      "Describe who uses it, who decides, who pays, and why they would switch from a current alternative.",
      "Present fixed and variable costs, pricing or revenue model, assumptions, margin, and runway as verifiable hypotheses.",
      "Prioritize three measurable 90-day milestones, owners, dependencies, and a risk register with mitigations.",
    ],
    deliverable: "Lienzo de negocio, tabla de supuestos, métricas de activación/retención y hoja de ruta trimestral.",
    deliverableEn: "Business model canvas, assumptions table, activation/retention metrics, and a quarterly roadmap.",
    check: "¿Puedes diferenciar datos medidos, estimaciones y aspiraciones en cada cifra?",
    checkEn: "Can you distinguish measured data, estimates, and aspirations for every number?",
  },
  {
    id: COURSE_MODULE_IDS[4],
    number: "05",
    title: "Presenta un pitch honesto ante posibles inversionistas",
    titleEn: "Present an honest pitch to potential investors",
    goal: "Contar una historia de negocio breve, sustentada y adecuada a la etapa real del proyecto.",
    goalEn: "Tell a concise, evidence-backed business story aligned with the project's actual stage.",
    lesson: [
      "Ordena el pitch: problema, cliente, solución, evidencia, mercado, competencia, modelo, equipo, hitos, riesgos y solicitud concreta.",
      "Distingue ingresos, cartas de intención, pruebas piloto, usuarios activos y proyecciones. No intercambies una métrica por otra.",
      "Indica el monto que buscas, el instrumento si ya se conoce, el uso de fondos por hitos y qué evidencia falta. Protege datos confidenciales en el primer contacto.",
    ],
    lessonEn: [
      "Structure the pitch: problem, customer, solution, evidence, market, competition, model, team, milestones, risks, and a clear ask.",
      "Distinguish revenue, letters of intent, pilots, active users, and projections. Do not substitute one metric for another.",
      "State the amount sought, instrument if known, milestone-based use of funds, and missing evidence. Protect confidential data in the first contact.",
    ],
    deliverable: "Pitch de 8–10 diapositivas + resumen de una página + lista de preguntas difíciles y respuestas documentadas.",
    deliverableEn: "An 8–10 slide pitch + one-page summary + difficult questions with documented answers.",
    check: "¿Queda claro qué pides, qué demostrarás con los recursos y cuáles son los principales riesgos?",
    checkEn: "Is it clear what you ask for, what the resources will prove, and the main risks?",
  },
]

export default async function MemberFormationPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const session = await auth.api.getSession({ headers: await headers() })
  let activeMembership = false
  let completed: string[] = []
  let progressAvailable = true

  if (session?.user) {
    try {
      const [membership] = await db.select({ id: membershipSubscriptions.id })
        .from(membershipSubscriptions)
        .where(and(
          eq(membershipSubscriptions.userId, session.user.id),
          inArray(membershipSubscriptions.status, ["active", "trialing"]),
        ))
        .limit(1)
      activeMembership = Boolean(membership)
      if (activeMembership) {
        const records = await db.select({ moduleId: memberCourseProgress.moduleId })
          .from(memberCourseProgress)
          .where(and(
            eq(memberCourseProgress.userId, session.user.id),
            eq(memberCourseProgress.courseSlug, COURSE_SLUG),
            inArray(memberCourseProgress.moduleId, [...COURSE_MODULE_IDS]),
          ))
        completed = records.map((record) => record.moduleId)
      }
    } catch {
      progressAvailable = false
    }
  }

  return <TamvAppShell locale={locale}>
    <PageIntro
      eyebrow={english ? "MEMBER LEARNING PATH · PRACTICAL COURSE" : "RUTA FORMATIVA DE MIEMBROS · CURSO PRÁCTICO"}
      title={english ? "From developer profile" : "Del perfil de desarrollador"}
      accent={english ? "to an evidence-based pitch." : "a un pitch con evidencia."}
      description={english ? "Five modules built around practical deliverables for your professional identity, portfolio, startup and investor conversations." : "Cinco módulos orientados a entregables prácticos para tu identidad profesional, portafolio, startup y conversaciones con inversionistas."}
      locale={locale}
    />
    <section className="section"><div className="container">
      {!session?.user ? (
        <div className="membership-gate">
          <ShieldCheck aria-hidden="true" /><h2>{english ? "Sign in to check your access" : "Inicia sesión para comprobar tu acceso"}</h2>
          <p>{english ? "Member lessons and saved progress require a TAMV account with an active individual or business subscription." : "Las lecciones para miembros y el progreso guardado requieren una cuenta TAMV con una suscripción individual o empresarial activa."}</p>
          <div className="membership-gate-actions"><Link className="button" href="/sign-in">{english ? "Sign in" : "Iniciar sesión"}</Link><Link className="button button-secondary" href="/membresias">{english ? "View memberships" : "Ver membresías"}</Link></div>
        </div>
      ) : !activeMembership ? (
        <div className="membership-gate">
          <ShieldCheck aria-hidden="true" /><h2>{english ? "This course is included with a paid membership" : "Este curso está incluido en una membresía de pago"}</h2>
          <p>{english ? "Choose the individual plan for MXN $229/month or the business plan for MXN $699/month per organization." : "Elige el plan individual de $229 MXN al mes o el plan empresarial de $699 MXN al mes por organización."}</p>
          <div className="membership-gate-actions"><Link className="button button-secondary" href="/membresias">{english ? "Compare plans" : "Comparar planes"} <ArrowUpRight aria-hidden="true" /></Link><MembershipCheckout planId="individual" locale={locale} /></div>
        </div>
      ) : (
        <>
          <div className="course-course-intro">
            <p className="eyebrow">{english ? "COURSE · PROFILE AND PITCH" : "CURSO · PERFIL Y PITCH"}</p>
            <h2>{english ? "What you will leave with" : "Con qué saldrás del curso"}</h2>
            <p>{english ? "A verifiable developer profile, a reproducible portfolio, a tested problem statement, a business model with explicit assumptions, and an investor pitch that communicates both evidence and risks." : "Un perfil de desarrollo verificable, un portafolio reproducible, un problema validado, un modelo de negocio con supuestos explícitos y un pitch que comunica evidencia y riesgos."}</p>
            <div className="course-outcomes">
              <span><CheckCircle2 aria-hidden="true" />{english ? "5 practical deliverables" : "5 entregables prácticos"}</span>
              <span><Target aria-hidden="true" />{english ? "Evidence over claims" : "Evidencia antes que promesas"}</span>
              <span><FileText aria-hidden="true" />{english ? "Templates you can adapt" : "Plantillas adaptables"}</span>
            </div>
          </div>

          {progressAvailable
            ? <MemberCourseProgress modules={modules.map(({ id, title, titleEn }) => ({ id, title: english ? titleEn : title }))} initialCompleted={completed} locale={locale} />
            : <p className="billing-error" role="status">{english ? "Progress storage is unavailable. Check that the membership migration has been applied; do not mark this course as complete." : "No está disponible el guardado del progreso. Comprueba que se aplicó la migración de membresías; no marques este curso como completado."}</p>}

          <div className="course-module-list">
            {modules.map((module) => (
              <article className="course-module" key={module.id}>
                <div className="course-module-number">{module.number}</div>
                <div className="course-module-content">
                  <p className="eyebrow">{english ? "MODULE" : "MÓDULO"} {module.number}</p>
                  <h2>{english ? module.titleEn : module.title}</h2>
                  <p className="course-module-goal"><strong>{english ? "Learning goal: " : "Objetivo de aprendizaje: "}</strong>{english ? module.goalEn : module.goal}</p>
                  <ul>{(english ? module.lessonEn : module.lesson).map((lesson) => <li key={lesson}>{lesson}</li>)}</ul>
                  <div className="course-deliverable"><BookOpenCheck aria-hidden="true" /><p><strong>{english ? "Deliverable: " : "Entregable: "}</strong>{english ? module.deliverableEn : module.deliverable}</p></div>
                  <p className="course-reflection"><Lightbulb aria-hidden="true" /><span><strong>{english ? "Self-review: " : "Autoevaluación: "}</strong>{english ? module.checkEn : module.check}</span></p>
                </div>
              </article>
            ))}
          </div>
          <div className="membership-course-callout course-external-network">
            <div><ShieldCheck aria-hidden="true" /><h2>{english ? "External network: AI Lounge" : "Red externa: AI Lounge"}</h2></div>
            <p>{english
              ? "Use this path to review your builder profile, highlight verifiable work, and check which external startup perks match your actual company stage. AI Lounge is independently operated; TAMV does not issue an access token or paid membership pass, and eligibility for contacts, warm introductions, masterminds, credits, or investor programs is set by the provider."
              : "Usa esta ruta para revisar tu perfil como creador, destacar trabajos verificables y comprobar qué beneficios externos para startups corresponden a la etapa real de tu empresa. AI Lounge es independiente; TAMV no emite un token de acceso ni una membresía de pago y los requisitos para contactos, presentaciones, sesiones, créditos o programas de inversión los determina el proveedor."}</p>
            <ol>
              <li>{english ? "Create or sign in to an AI Lounge account you control." : "Crea tu cuenta de AI Lounge o inicia sesión en una que ya controles."}</li>
              <li>{english ? "Complete your builder profile with accurate stage and evidence; do not inflate revenue or credentials." : "Completa el perfil con etapa y evidencias exactas; no exageres ingresos ni credenciales."}</li>
              <li>{english ? "Review eligibility and terms before applying or sharing confidential information." : "Revisa los requisitos y términos antes de postular o compartir información confidencial."}</li>
            </ol>
            <div className="membership-external-links">
              <a className="text-link" href="https://ai.lounge.ai/%40tamvonline" target="_blank" rel="noopener noreferrer">{english ? "View TAMV community profile" : "Ver el perfil comunitario de TAMV"} <ArrowUpRight aria-hidden="true" /></a>
              <a className="text-link" href="https://ai.lounge.ai/" target="_blank" rel="noopener noreferrer">{english ? "Open AI Lounge" : "Abrir AI Lounge"} <ArrowUpRight aria-hidden="true" /></a>
              <a className="text-link" href="https://ai.lounge.ai/perks" target="_blank" rel="noopener noreferrer">{english ? "Check startup perks" : "Consultar beneficios para startups"} <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "Completion is a personal learning record, not an accredited qualification, a TAMV project acceptance, or a promise of funding. Validate legal, financial and market assumptions with qualified professionals." : "La finalización es un registro de aprendizaje personal, no una acreditación, aceptación automática en un proyecto TAMV ni promesa de financiamiento. Valida los supuestos legales, financieros y de mercado con profesionales competentes."}</p></div>
        </>
      )}
      <p className="membership-back-link"><Link className="text-link" href="/membresias"><ArrowLeft aria-hidden="true" /> {english ? "Back to memberships" : "Volver a membresías"}</Link></p>
    </div></section>
  </TamvAppShell>
}
