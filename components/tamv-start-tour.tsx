"use client"

import Link from "next/link"
import { useEffect, useId, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CircleDollarSign, Compass, FileCheck2, RotateCcw, UserRound, UsersRound } from "lucide-react"
import { localizedPath, type Locale } from "@/lib/i18n"

type GoalId = "account" | "research" | "publish" | "support" | "contribute"
type TourStep = { title: string; detail: string; route?: string; action?: string }
type TourGoal = {
  id: GoalId
  icon: typeof Compass
  title: string
  when: string
  purpose: string
  steps: TourStep[]
  measure: string
  limit: string
}

const STORAGE_KEY = "tamv:start-tour:v1"
const goalIds: GoalId[] = ["account", "research", "publish", "support", "contribute"]

function routeWithLocale(route: string, locale: Locale) {
  const [path, hash] = route.split("#", 2)
  return `${localizedPath(path, locale)}${hash ? `#${hash}` : ""}`
}

function getGoals(locale: Locale): TourGoal[] {
  const english = locale === "en"
  if (english) {
    return [
      {
        id: "account",
        icon: UserRound,
        title: "Create your account",
        when: "When you want a private profile, submit a proposal, save course progress, or manage a membership.",
        purpose: "Account access is handled by Better Auth at TAMV's real registration and sign-in routes.",
        steps: [
          { title: "Review the available modes", detail: "Open /cuenta and compare Free and Premium. Free does not require a card; paid access has separate conditions.", route: "/cuenta", action: "Review account modes" },
          { title: "Read privacy and membership terms", detail: "Before providing personal data or paying, review /privacidad and /membresias/condiciones. Note the current terms version.", route: "/privacidad", action: "Read the privacy notice" },
          { title: "Register or sign in", detail: "Use /sign-up for a new account or /sign-in if you already have one. Do not send passwords or access codes to the assistant.", route: "/sign-up", action: "Open registration" },
          { title: "Confirm access in the portal", detail: "Open /portal and check your name and available counters. A submitted form is not enough; the authenticated portal must confirm your session.", route: "/portal", action: "Check the portal" },
        ],
        measure: "The portal shows your authenticated account and the private resources available to it.",
        limit: "Registration does not verify a TRI role, ORCID ownership, membership payment, or institutional affiliation. Those require their own confirmation.",
      },
      {
        id: "research",
        icon: BookOpen,
        title: "Research and check sources",
        when: "When you need to substantiate a question, find public research metadata, or prepare evidence for a proposal.",
        purpose: "Research routes help you discover records and inspect their original sources; a search result is not scientific validation.",
        steps: [
          { title: "Write one answerable question", detail: "State the topic, population or territory, and what you need to know. Start with three to six specific keywords." },
          { title: "Search the research area", detail: "Open /investigacion and use federated search. Provider availability is reported separately; an unavailable provider is not replaced with invented records.", route: "/investigacion#buscador-federado", action: "Open federated search" },
          { title: "Open the original record", detail: "Check authorship, publication date, method, version, license, and the object linked by the DOI or repository record.", route: "/fuentes", action: "Review source guidance" },
          { title: "Record what the evidence does not prove", detail: "Keep a short note separating the source's claims from your interpretation, unresolved gaps, and any need for independent review.", route: "/excelencia", action: "Open evidence criteria" },
        ],
        measure: "You can identify the original source, its date and license, the claim it supports, and at least one limitation.",
        limit: "A DOI, repository record, abstract, or search result does not by itself prove peer review, reproducibility, accreditation, or causal impact.",
      },
      {
        id: "publish",
        icon: FileCheck2,
        title: "Submit research for review",
        when: "When you have a defined article, dataset, thesis, report, prototype, course, or other research output to submit.",
        purpose: "Submissions begin privately in the research portal and move through explicit review; opening the form does not publish the work.",
        steps: [
          { title: "Prepare the submission record", detail: "Gather title, type, abstract, question, method, sources, limits, and license. Do not include secrets or third-party personal data without permission.", route: "/unete#unete-publicar", action: "Read the publication route" },
          { title: "Open the proposal form", detail: "Use /portal/propuestas/nueva. The portal requires authentication; if redirected, sign in and return to the same route.", route: "/portal/propuestas/nueva", action: "Open the proposal form" },
          { title: "Choose publication consent deliberately", detail: "The abstract can become public only after publication and with explicit consent. A private submission is not public metadata.", route: "/portal/propuestas", action: "Track your proposals" },
          { title: "Wait for a recorded decision", detail: "Follow the proposal's review state and any feedback or appeal route. Submission does not guarantee acceptance, publication, financing, or a DOI.", route: "/gobernanza", action: "Review governance rules" },
        ],
        measure: "The proposal appears in your private portal with its current state; any later publication has a public record and declared consent.",
        limit: "TAMV does not mint or guarantee a DOI from this form. A DOI exists only when an authorized repository confirms it and the public landing page resolves.",
      },
      {
        id: "support",
        icon: CircleDollarSign,
        title: "Support or choose a membership",
        when: "When you want to sustain the project voluntarily or compare access included with a paid membership.",
        purpose: "Donation and membership routes disclose their actual availability before any payment is initiated.",
        steps: [
          { title: "Choose the appropriate route", detail: "Use /apoyar for voluntary support and /membresias for recurring membership access. They are different commitments.", route: "/apoyar", action: "Open support options" },
          { title: "Check availability and recipient", detail: "If checkout is not configured, the page says so and does not collect payment. If configured, verify the HTTPS provider destination and recipient.", route: "/membresias", action: "Compare memberships" },
          { title: "Read the exact terms", detail: "Review price, billing period, renewal, cancellation, fees, privacy, and the accepted terms version before continuing.", route: "/membresias/condiciones", action: "Read membership terms" },
          { title: "Keep provider confirmation", detail: "A browser success screen is not enough. Retain the provider receipt and confirm the resulting access or support record through the official channel.", route: "/cuenta", action: "Review account access" },
        ],
        measure: "You can name the route used, amount or plan, terms version, provider confirmation, and where the resulting status is checked.",
        limit: "No payment starts from this tutorial. Support is not investment, tax-deductible status, project funding, or a guarantee of membership activation.",
      },
      {
        id: "contribute",
        icon: UsersRound,
        title: "Contribute or collaborate",
        when: "When you can offer research, code, review, territorial knowledge, documentation, or a specific project proposal.",
        purpose: "Participation starts with a concrete contribution, evidence, and the correct review channel—not a generic request to join.",
        steps: [
          { title: "Choose your contribution door", detail: "Open /unete and compare research, engineering, neutral review, and territorial collaboration. Identify what you can actually deliver.", route: "/unete", action: "Compare participation doors" },
          { title: "Prepare a narrow contribution", detail: "Define the problem, beneficiary, scope, evidence, risks, dependencies, and first verifiable result. Keep private material out of public forms.", route: "/desarrolladores", action: "Read contributor guidance" },
          { title: "Use the real submission channel", detail: "For research or project proposals, use the authenticated portal. For a specific code contribution, start with a reproducible issue and tests in the official repository.", route: "/portal/propuestas/nueva", action: "Open the proposal portal" },
          { title: "Wait for explicit review", detail: "Track the response and resolve requested evidence gaps. Contact or submission does not equal acceptance, employment, funding, or authority to act for TAMV.", route: "/comunidad", action: "Open community resources" },
        ],
        measure: "Your contribution has a clear owner, scope, evidence, submission reference, and next review step.",
        limit: "The tutorial grants no repository access, moderation authority, funding commitment, or permission to publish third-party data.",
      },
    ]
  }

  return [
    {
      id: "account",
      icon: UserRound,
      title: "Crea tu cuenta",
      when: "Cuando quieras un perfil privado, enviar una propuesta, guardar avance formativo o gestionar una membresía.",
      purpose: "El acceso se gestiona con Better Auth en las rutas reales de registro e inicio de sesión de TAMV.",
      steps: [
        { title: "Revisa las modalidades", detail: "Abre /cuenta y compara Free y Premium. Free no requiere tarjeta; el acceso de pago tiene condiciones separadas.", route: "/cuenta", action: "Revisar modalidades" },
        { title: "Lee privacidad y condiciones", detail: "Antes de entregar datos personales o pagar, revisa /privacidad y /membresias/condiciones. Anota la versión vigente.", route: "/privacidad", action: "Leer aviso de privacidad" },
        { title: "Regístrate o inicia sesión", detail: "Usa /sign-up para una cuenta nueva o /sign-in si ya tienes una. No envíes contraseñas ni códigos al asistente.", route: "/sign-up", action: "Abrir registro" },
        { title: "Confirma el acceso en el portal", detail: "Abre /portal y comprueba tu nombre y los contadores disponibles. Enviar el formulario no basta: el portal autenticado debe confirmar la sesión.", route: "/portal", action: "Comprobar el portal" },
      ],
      measure: "El portal muestra tu cuenta autenticada y los recursos privados disponibles para ella.",
      limit: "Registrarse no verifica un rol TRI, la propiedad de un ORCID, el pago de una membresía ni una afiliación institucional. Cada uno requiere su propia confirmación.",
    },
    {
      id: "research",
      icon: BookOpen,
      title: "Investiga y contrasta fuentes",
      when: "Cuando necesites sustentar una pregunta, encontrar metadatos públicos de investigación o preparar evidencia para una propuesta.",
      purpose: "Las rutas de investigación te ayudan a descubrir registros y revisar sus fuentes originales; un resultado no constituye validación científica.",
      steps: [
        { title: "Formula una pregunta contestable", detail: "Define tema, población o territorio y qué necesitas saber. Empieza con tres a seis palabras clave específicas." },
        { title: "Busca en el área de investigación", detail: "Abre /investigacion y usa la búsqueda federada. La disponibilidad de cada proveedor se informa por separado; un proveedor caído no se sustituye por registros inventados.", route: "/investigacion#buscador-federado", action: "Abrir búsqueda federada" },
        { title: "Abre el registro original", detail: "Comprueba autoría, fecha, método, versión, licencia y el objeto enlazado por el DOI o registro del repositorio.", route: "/fuentes", action: "Revisar guía de fuentes" },
        { title: "Registra lo que la evidencia no demuestra", detail: "Separa las afirmaciones de la fuente de tu interpretación, las brechas pendientes y la necesidad de revisión independiente.", route: "/excelencia", action: "Abrir criterios de evidencia" },
      ],
      measure: "Puedes identificar la fuente original, su fecha y licencia, la afirmación que respalda y al menos una limitación.",
      limit: "Un DOI, registro de repositorio, resumen o resultado de búsqueda no demuestra por sí solo revisión por pares, reproducibilidad, acreditación ni impacto causal.",
    },
    {
      id: "publish",
      icon: FileCheck2,
      title: "Envía investigación a revisión",
      when: "Cuando tengas un artículo, conjunto de datos, tesis, reporte, prototipo, curso u otro resultado definido para enviar.",
      purpose: "Los envíos comienzan de forma privada en el portal y avanzan mediante revisión explícita; abrir el formulario no publica la obra.",
      steps: [
        { title: "Prepara la ficha del envío", detail: "Reúne título, tipo, resumen, pregunta, método, fuentes, límites y licencia. No incluyas secretos ni datos personales de terceros sin permiso.", route: "/unete#unete-publicar", action: "Leer ruta de publicación" },
        { title: "Abre el formulario de propuesta", detail: "Usa /portal/propuestas/nueva. El portal requiere autenticación; si te redirige, inicia sesión y vuelve a la misma ruta.", route: "/portal/propuestas/nueva", action: "Abrir formulario" },
        { title: "Decide el consentimiento de publicación", detail: "El resumen solo puede hacerse público después de publicarse y con consentimiento explícito. Un envío privado no es metadato público.", route: "/portal/propuestas", action: "Seguir tus propuestas" },
        { title: "Espera una decisión registrada", detail: "Consulta el estado de revisión, los comentarios y la vía de apelación. Enviar no garantiza aceptación, publicación, financiación ni DOI.", route: "/gobernanza", action: "Revisar reglas de gobernanza" },
      ],
      measure: "La propuesta aparece en tu portal privado con su estado; cualquier publicación posterior tiene registro público y consentimiento declarado.",
      limit: "TAMV no emite ni garantiza un DOI desde este formulario. Solo existe cuando un repositorio autorizado lo confirma y su página pública resuelve.",
    },
    {
      id: "support",
      icon: CircleDollarSign,
      title: "Apoya o elige una membresía",
      when: "Cuando quieras sostener el proyecto voluntariamente o comparar el acceso incluido en una membresía de pago.",
      purpose: "Las rutas de apoyo y membresía informan su disponibilidad real antes de iniciar cualquier pago.",
      steps: [
        { title: "Elige la ruta adecuada", detail: "Usa /apoyar para apoyo voluntario y /membresias para acceso recurrente. Son compromisos distintos.", route: "/apoyar", action: "Abrir opciones de apoyo" },
        { title: "Comprueba disponibilidad y destinatario", detail: "Si el checkout no está configurado, la página lo informa y no cobra. Si está configurado, verifica el destino HTTPS del proveedor y el destinatario.", route: "/membresias", action: "Comparar membresías" },
        { title: "Lee las condiciones exactas", detail: "Revisa precio, periodicidad, renovación, cancelación, comisiones, privacidad y la versión de condiciones aceptada antes de continuar.", route: "/membresias/condiciones", action: "Leer condiciones" },
        { title: "Conserva la confirmación del proveedor", detail: "Una pantalla de éxito no basta. Guarda el recibo y confirma el acceso o registro de apoyo resultante por el canal oficial.", route: "/cuenta", action: "Revisar acceso de cuenta" },
      ],
      measure: "Puedes indicar la ruta usada, importe o plan, versión de condiciones, confirmación del proveedor y dónde comprobar el resultado.",
      limit: "Este tutorial no inicia pagos. Apoyar no equivale a invertir, obtener deducibilidad fiscal, financiar un proyecto ni garantizar activación de membresía.",
    },
    {
      id: "contribute",
      icon: UsersRound,
      title: "Contribuye o colabora",
      when: "Cuando puedas aportar investigación, código, revisión, conocimiento territorial, documentación o una propuesta concreta.",
      purpose: "La participación empieza con una contribución específica, evidencia y el canal de revisión correcto; no con una solicitud genérica de ingreso.",
      steps: [
        { title: "Elige tu puerta de contribución", detail: "Abre /unete y compara investigación, ingeniería, revisión neutral y colaboración territorial. Identifica qué puedes entregar realmente.", route: "/unete", action: "Comparar puertas de participación" },
        { title: "Prepara una contribución acotada", detail: "Define problema, beneficiario, alcance, evidencia, riesgos, dependencias y primer resultado verificable. Deja material privado fuera de formularios públicos.", route: "/desarrolladores", action: "Leer guía para contribuir" },
        { title: "Usa el canal real de envío", detail: "Para investigación o proyectos, usa el portal autenticado. Para código, empieza con un issue reproducible y pruebas en el repositorio oficial.", route: "/portal/propuestas/nueva", action: "Abrir portal de propuestas" },
        { title: "Espera una revisión explícita", detail: "Da seguimiento y resuelve las brechas solicitadas. Contactar o enviar no equivale a aceptación, empleo, financiación ni autoridad para actuar por TAMV.", route: "/comunidad", action: "Abrir recursos comunitarios" },
      ],
      measure: "Tu contribución tiene responsable, alcance, evidencia, referencia de envío y siguiente paso de revisión.",
      limit: "El tutorial no concede acceso a repositorios, autoridad de moderación, compromisos de fondos ni permiso para publicar datos de terceros.",
    },
  ]
}

function readStoredProgress(goals: TourGoal[]) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as { goal?: unknown; completed?: unknown }
    if (!goalIds.includes(value.goal as GoalId) || !Array.isArray(value.completed)) return null
    const goal = goals.find((item) => item.id === value.goal)
    if (!goal) return null
    const allowed = new Set(goals.flatMap((item) => item.steps.map((_, index) => `${item.id}:${index}`)))
    const completed = [...new Set(value.completed.filter((item): item is string => typeof item === "string" && allowed.has(item)))].slice(0, 20)
    return { goal: goal.id, completed }
  } catch {
    return null
  }
}

export function TamvStartTour({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const goals = useMemo(() => getGoals(locale), [locale])
  const [selectedId, setSelectedId] = useState<GoalId>("account")
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const headingId = useId()

  const selected = goals.find((goal) => goal.id === selectedId) ?? goals[0]
  const step = selected.steps[stepIndex] ?? selected.steps[0]
  const completedHere = selected.steps.filter((_, index) => completed.includes(`${selected.id}:${index}`)).length
  const finished = completedHere === selected.steps.length

  useEffect(() => {
    const stored = readStoredProgress(goals)
    if (stored) {
      setSelectedId(stored.goal)
      const goal = goals.find((item) => item.id === stored.goal)
      const firstOpen = goal?.steps.findIndex((_, index) => !stored.completed.includes(`${stored.goal}:${index}`)) ?? 0
      setStepIndex(firstOpen < 0 ? Math.max(0, (goal?.steps.length ?? 1) - 1) : firstOpen)
      setCompleted(stored.completed)
    }
    setHydrated(true)
  }, [goals])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal: selectedId, completed }))
    } catch {
      return
    }
  }, [completed, hydrated, selectedId])

  function chooseGoal(id: GoalId) {
    const goal = goals.find((item) => item.id === id)
    if (!goal) return
    setSelectedId(id)
    const firstOpen = goal.steps.findIndex((_, index) => !completed.includes(`${id}:${index}`))
    setStepIndex(firstOpen < 0 ? Math.max(0, goal.steps.length - 1) : firstOpen)
  }

  function advance() {
    const key = `${selected.id}:${stepIndex}`
    setCompleted((current) => current.includes(key) ? current : [...current, key])
    setStepIndex((current) => Math.min(current + 1, selected.steps.length - 1))
  }

  function reset() {
    setCompleted((current) => current.filter((key) => !key.startsWith(`${selected.id}:`)))
    setStepIndex(0)
  }

  return (
    <section className="section tamv-start-tour" aria-labelledby={headingId}>
      <div className="container">
        <div className="tamv-start-tour-heading">
          <div>
            <p className="eyebrow">{english ? "START TOUR / CHOOSE YOUR GOAL" : "RECORRIDO DE INICIO / ELIGE TU META"}</p>
            <h2 id={headingId}>{english ? <>What do you want to <em>do today?</em></> : <>¿Qué quieres <em>hacer hoy?</em></>}</h2>
          </div>
          <p>{english ? "A short, practical route for the main actions in TAMV. Each step names where to go, what to prepare, and how to verify the result." : "Una ruta breve y práctica para las acciones principales de TAMV. Cada paso indica dónde ir, qué preparar y cómo comprobar el resultado."}</p>
        </div>

        <div className="tamv-start-goals" role="group" aria-label={english ? "Choose a tutorial goal" : "Elige una meta del tutorial"}>
          {goals.map((goal) => {
            const Icon = goal.icon
            return <button key={goal.id} type="button" className={selected.id === goal.id ? "is-active" : ""} aria-pressed={selected.id === goal.id} onClick={() => chooseGoal(goal.id)}><Icon aria-hidden="true" /><span>{goal.title}</span></button>
          })}
        </div>

        <div className="tamv-start-tour-grid">
          <article className="tamv-start-tour-card" aria-live="polite">
            <header className="tamv-start-tour-card-head">
              <div><p className="eyebrow">{english ? "PURPOSE" : "PARA QUÉ SIRVE"}</p><h3>{selected.title}</h3></div>
              <span>{String(stepIndex + 1).padStart(2, "0")} / {String(selected.steps.length).padStart(2, "0")}</span>
            </header>
            <p className="tamv-start-tour-purpose">{selected.purpose}</p>
            <dl className="tamv-start-tour-facts"><div><dt>{english ? "When to use this route" : "Cuándo usar esta ruta"}</dt><dd>{selected.when}</dd></div></dl>

            <ol className="tamv-start-tour-progress" aria-label={english ? "Tutorial steps" : "Pasos del tutorial"}>
              {selected.steps.map((item, index) => {
                const done = completed.includes(`${selected.id}:${index}`)
                return <li key={item.title} className={index === stepIndex ? "is-current" : ""}><button type="button" onClick={() => setStepIndex(index)} aria-current={index === stepIndex ? "step" : undefined}><span>{done ? <Check aria-hidden="true" /> : index + 1}</span>{item.title}</button></li>
              })}
            </ol>

            <div className="tamv-start-tour-step">
              <p className="eyebrow">{english ? `STEP ${stepIndex + 1}` : `PASO ${stepIndex + 1}`}</p>
              <h4>{step.title}</h4>
              <p>{step.detail}</p>
              {step.route ? <Link className="tamv-start-tour-action" href={routeWithLocale(step.route, locale)}>{step.action ?? (english ? "Open route" : "Abrir ruta")}<ArrowUpRight aria-hidden="true" /></Link> : null}
            </div>

            <footer className="tamv-start-tour-controls">
              <button type="button" className="tamv-start-tour-secondary" onClick={() => setStepIndex((current) => Math.max(0, current - 1))} disabled={stepIndex === 0}><ArrowLeft aria-hidden="true" />{english ? "Previous" : "Anterior"}</button>
              <span>{completedHere}/{selected.steps.length}</span>
              <button type="button" className="tamv-start-tour-next" onClick={advance}>{stepIndex === selected.steps.length - 1 ? (english ? "Finish route" : "Finalizar ruta") : (english ? "Complete and continue" : "Completar y continuar")}<ArrowRight aria-hidden="true" /></button>
            </footer>
          </article>

          <aside className="tamv-start-tour-aside">
            <div className="tamv-start-tour-measure">
              <Check aria-hidden="true" />
              <div><p className="eyebrow">{english ? "HOW TO VERIFY IT" : "CÓMO COMPROBARLO"}</p><h3>{finished ? (english ? "Route completed in this browser" : "Ruta completada en este navegador") : (english ? "Observable result" : "Resultado observable")}</h3><p>{selected.measure}</p></div>
            </div>
            <div className="tamv-start-tour-limit">
              <p className="eyebrow">{english ? "LIMITS" : "LÍMITES"}</p>
              <p>{selected.limit}</p>
            </div>
            <div className="tamv-start-tour-storage">
              <Compass aria-hidden="true" />
              <p>{english ? "Progress is stored only in this browser. It is not saved to your TAMV account and does not confirm that an external process finished." : "El avance se guarda solo en este navegador. No se guarda en tu cuenta TAMV y no confirma que un proceso externo haya terminado."}</p>
              <button type="button" onClick={reset}><RotateCcw aria-hidden="true" />{english ? "Reset this route" : "Reiniciar esta ruta"}</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
