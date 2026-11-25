"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, LockKeyhole, Route } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type RouteResult = {
  id: string
  titleEs: string
  titleEn: string
  explanationEs: string
  explanationEn: string
  destination: string
  destinationEs: string
  destinationEn: string
  chainEs: string[]
  chainEn: string[]
}
const routes: RouteResult[] = [
  {
    id: "governance", titleEs: "Gobernanza y límites", titleEn: "Governance and boundaries",
    explanationEs: "La intención encaja mejor con los principios de gobernanza publicados. La ruta solo dirige a material público y no comprueba el estado normativo de una jurisdicción.",
    explanationEn: "The request best matches the published governance principles. This route leads only to public materials and does not assess a jurisdiction's regulatory status.",
    destination: "/gobernanza", destinationEs: "Abrir gobernanza", destinationEn: "Open governance",
    chainEs: ["HC-1 · clasificación local por patrones de lenguaje", "HC-2 · plan de navegación de solo lectura", "HC-6 · cualquier acción privilegiada requiere política de servidor y evidencia real"],
    chainEn: ["HC-1 · local language-pattern classification", "HC-2 · read-only navigation plan", "HC-6 · privileged actions require server policy and real evidence"],
  },
  {
    id: "isabella", titleEs: "Isabella y arquitectura cognitiva", titleEn: "Isabella and cognitive architecture",
    explanationEs: "La ruta abre la documentación pública de Isabella. No inicia una sesión de agente ni transmite la intención a un modelo.",
    explanationEn: "This route opens Isabella's public documentation. It does not start an agent session or transmit the intent to a model.",
    destination: "/isabella", destinationEs: "Consultar Isabella", destinationEn: "Explore Isabella",
    chainEs: ["HC-1 · coincidencia local con IA, CROWN, TINA o agentes", "HC-2 · se propone una ruta documental", "HC-6 · ejecución y efectos externos no disponibles en este router"],
    chainEn: ["HC-1 · local match for AI, CROWN, TINA, or agents", "HC-2 · suggest a documentary route", "HC-6 · execution and external effects are not available in this router"],
  },
  {
    id: "territory", titleEs: "Territorio y RDM Digital", titleEn: "Territory and RDM Digital",
    explanationEs: "Se dirige a los proyectos y referencias territoriales. No se recibe telemetría de sensores, cámaras ni gemelo 4D desde esta interfaz.",
    explanationEn: "Routes to territorial projects and references. No sensor, camera, or 4D twin telemetry is received by this interface.",
    destination: "/proyectos", destinationEs: "Consultar proyectos", destinationEn: "Browse projects",
    chainEs: ["HC-1 · coincidencia local con territorio, RDM, Mineral del Monte o gemelo", "HC-2 · ruta de descubrimiento de proyectos", "HC-6 · no se infiere estado territorial en vivo"],
    chainEn: ["HC-1 · local match for territory, RDM, Mineral del Monte, or twin", "HC-2 · project discovery route", "HC-6 · no live territorial state is inferred"],
  },
  {
    id: "research", titleEs: "Ciencia abierta y procedencia", titleEn: "Open research and provenance",
    explanationEs: "Dirige a la investigación publicada y a los registros persistentes enlazados. La cita y el estado editorial deben validarse con cada fuente.",
    explanationEn: "Routes to published research and linked persistent records. Citations and editorial status must be checked against each source.",
    destination: "/investigacion", destinationEs: "Abrir investigación", destinationEn: "Open research",
    chainEs: ["HC-1 · coincidencia local con DOI, ORCID, fuentes o investigación", "HC-2 · navegación hacia registros públicos", "HC-6 · no se declara aceptación, arbitraje ni acreditación"],
    chainEn: ["HC-1 · local match for DOI, ORCID, sources, or research", "HC-2 · navigate to public records", "HC-6 · no acceptance, peer review, or accreditation is asserted"],
  },
  {
    id: "developers", titleEs: "Desarrollo e interoperabilidad", titleEn: "Development and interoperability",
    explanationEs: "Enruta hacia documentación de desarrollo y contratos públicos. No ejecuta código encontrado en otros repositorios ni crea credenciales.",
    explanationEn: "Routes to developer documentation and public contracts. It does not execute code from other repositories or create credentials.",
    destination: "/desarrolladores", destinationEs: "Abrir guía de desarrollo", destinationEn: "Open developer guide",
    chainEs: ["HC-1 · coincidencia local con API, código, repositorio o integración", "HC-2 · navegación a documentación técnica", "HC-6 · sin mutaciones, tokens ni ejecución"],
    chainEn: ["HC-1 · local match for API, code, repository, or integration", "HC-2 · navigate to technical documentation", "HC-6 · no mutations, tokens, or execution"],
  },
  {
    id: "community", titleEs: "Comunidad y participación", titleEn: "Community and participation",
    explanationEs: "Dirige a las rutas públicas de comunidad o apoyo. No acepta propuestas automáticamente ni afirma que haya financiación disponible.",
    explanationEn: "Routes to public community or support pages. It does not automatically accept proposals or claim funding is available.",
    destination: "/comunidad", destinationEs: "Explorar comunidad", destinationEn: "Explore community",
    chainEs: ["HC-1 · coincidencia local con colaboración, comunidad o apoyo", "HC-2 · navegación a vías públicas de participación", "HC-6 · sin promesa de aceptación, empleo ni financiación"],
    chainEn: ["HC-1 · local match for collaboration, community, or support", "HC-2 · navigate to public participation routes", "HC-6 · no promise of acceptance, work, or funding"],
  },
  {
    id: "guide", titleEs: "Orientación inicial", titleEn: "Getting started",
    explanationEs: "No hay una coincidencia específica suficiente. La guía práctica es el punto de entrada más seguro para entender el sitio y sus límites.",
    explanationEn: "No specific match was strong enough. The practical guide is the safest starting point to understand the site and its boundaries.",
    destination: "/guia", destinationEs: "Abrir guía práctica", destinationEn: "Open practical guide",
    chainEs: ["HC-1 · intención no clasificada por las reglas locales", "HC-2 · ruta de orientación por defecto", "HC-6 · no se ejecuta ninguna acción"],
    chainEn: ["HC-1 · intent not classified by local rules", "HC-2 · default orientation route", "HC-6 · no action is executed"],
  },
]
function classifyIntent(input: string): RouteResult {
  const text = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
  const tests: [RegExp, string][] = [
    [/\b(gobernanza|crown|c\.r\.o\.w\.n|riesgo|jurisdiccion|regulacion|compliance|control universal)\b/, "governance"],
    [/\b(isabella|inteligencia artificial|agente|tina|terminus|bookpi)\b/, "isabella"],
    [/\b(territorio|real del monte|mineral del monte|gemelo|4d|rdm digital|sensor|camara)\b/, "territory"],
    [/\b(doi|orcid|figshare|zenodo|osf|investigacion|investigar|articulo|fuente|ciencia abierta)\b/, "research"],
    [/\b(api|codigo|desarrollador|desarrollo|repositorio|integracion|openapi)\b/, "developers"],
    [/\b(comunidad|colaborar|colaboracion|apoyar|participar|membresia|financiacion)\b/, "community"],
  ]
  const route = tests.find(([pattern]) => pattern.test(text))?.[1]
  return routes.find((item) => item.id === route) ?? routes[routes.length - 1]
}

export function TamvIntentRouter({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [intent, setIntent] = useState("")
  const [result, setResult] = useState<RouteResult | null>(null)
  const [submitted, setSubmitted] = useState(false)
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!intent.trim()) {
      setSubmitted(true)
      setResult(null)
      return
    }
    setResult(classifyIntent(intent))
    setSubmitted(false)
  }
  return (
    <section className="sovereign-intent-router" id="intent-router" aria-labelledby="intent-router-title">
      <div className="sovereign-panel-topline"><span><Route aria-hidden="true" /> {english ? "INTENT ROUTER" : "ROUTER DE INTENCIÓN"}</span><span className="sovereign-demo-label">{english ? "LOCAL ROUTING PREVIEW" : "VISTA PREVIA LOCAL"}</span></div>
      <h3 id="intent-router-title">{english ? "Express an intention. See the safe next step." : "Expresa una intención. Consulta el siguiente paso seguro."}</h3>
      <p>{english ? "Write what you want to discover. A deterministic local rule set proposes a public route and shows the capability boundary." : "Escribe qué quieres descubrir. Un conjunto local de reglas deterministas propone una ruta pública y expone el límite de capacidades."}</p>
      <form onSubmit={onSubmit} className="sovereign-intent-form">
        <label htmlFor="sovereign-intent-input">{english ? "Your intention" : "Tu intención"}</label>
        <div className="sovereign-intent-entry"><input id="sovereign-intent-input" value={intent} onChange={(event) => { setIntent(event.target.value); setResult(null); setSubmitted(false) }} maxLength={500} placeholder={english ? "e.g. Show me research sources for territorial memory" : "Ej. Muéstrame fuentes de investigación sobre memoria territorial"} /><button className="sovereign-action sovereign-action-primary" type="submit"><ArrowRight aria-hidden="true" />{english ? "Resolve route" : "Resolver ruta"}</button></div>
        {submitted && <p className="sovereign-intent-error" role="alert">{english ? "Enter an intention to resolve." : "Escribe una intención para resolver la ruta."}</p>}
      </form>
      {result && <div className="sovereign-intent-result" role="status" aria-live="polite">
        <div className="sovereign-inspector-heading"><span>{english ? "SUGGESTED DOMAIN" : "ÁMBITO SUGERIDO"}</span><span>{english ? "READ-ONLY ROUTE" : "RUTA DE SOLO LECTURA"}</span></div>
        <h4>{english ? result.titleEn : result.titleEs}</h4>
        <p>{english ? result.explanationEn : result.explanationEs}</p>
        <ol>{(english ? result.chainEn : result.chainEs).map((item) => <li key={item}>{item}</li>)}</ol>
        <a className="sovereign-action" href={result.destination}>{english ? result.destinationEn : result.destinationEs} <ArrowRight aria-hidden="true" /></a>
      </div>}
      <p className="sovereign-router-boundary"><LockKeyhole aria-hidden="true" />{english ? "Local classification only. This preview does not call Isabella or CROWN, use an LLM, read BookPI, persist intent, or execute an action. Production semantic routing remains unconnected." : "Clasificación local únicamente. Esta vista no invoca Isabella ni CROWN, no usa un LLM, no consulta BookPI, no guarda la intención ni ejecuta acciones. El router semántico de producción sigue sin conexión."}</p>
    </section>
  )
}
