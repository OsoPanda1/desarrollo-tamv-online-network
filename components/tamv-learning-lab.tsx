"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpRight, CheckCircle2, ClipboardCheck, Compass, Lightbulb, ListChecks, Route, Sparkles } from "lucide-react"
import { TAMV_LEARNING_PATHS } from "@/lib/tamv-learning-curriculum"
import { localizedPath, type Locale } from "@/lib/i18n"

type Level = "basic" | "intermediate" | "expert"
type Method = "steps" | "analogy" | "example" | "checklist" | "teachback"

const analogies: Record<string, { es: string; en: string }> = {
  start: { es: "Como entrar a una ciudad nueva: primero eliges tu destino, luego sigues las señales y al final compruebas que llegaste al lugar correcto.", en: "Like arriving in a new city: choose a destination, follow signs, then confirm you reached the right place." },
  projects: { es: "Como comparar talleres antes de contratar uno: mira qué ofrece, qué evidencia tiene de su trabajo y qué sigue pendiente.", en: "Like comparing workshops before hiring one: check what each offers, evidence of work, and what remains pending." },
  research: { es: "Como preparar una receta: una afirmación es el resultado, las fuentes son los ingredientes y el método explica cómo se combinaron.", en: "Like following a recipe: a claim is the result, sources are ingredients, and the method explains how they were combined." },
  hcu: { es: "Como un mapa del metro: dos estaciones conectadas ayudan a orientarte, pero el mapa no demuestra que una estación haya causado la otra.", en: "Like a subway map: connected stations help navigation, but the map does not prove one station caused another." },
  sources: { es: "Como revisar una etiqueta antes de comprar: el nombre no basta; revisas origen, fecha, contenido y lo que la etiqueta no garantiza.", en: "Like reading a product label: the name is not enough; check origin, date, contents, and what the label does not guarantee." },
  ecosystem: { es: "Como un directorio telefónico: confirma que un servicio está listado, no que esté contestando en este instante.", en: "Like a phone directory: it confirms a service is listed, not that someone is answering right now." },
  developers: { es: "Como conectar un electrodoméstico: lee el manual, confirma voltaje y conexión, prueba con seguridad y verifica el resultado.", en: "Like connecting an appliance: read the manual, check compatibility, test safely, and verify the result." },
  governance: { es: "Como las reglas de un laboratorio compartido: definen quién puede hacer qué, cómo se registra y qué hacer ante un riesgo.", en: "Like shared lab rules: they define who can do what, how work is recorded, and what to do when a risk appears." },
  community: { es: "Como proponer una mejora en tu colonia: explica el problema, muestra evidencia, define qué puedes aportar y espera una decisión explícita.", en: "Like proposing a neighborhood improvement: explain the problem, show evidence, state your contribution, and wait for an explicit decision." },
  training: { es: "Como un curso práctico: cada módulo es un ejercicio; terminarlo significa demostrar lo aprendido, no solo abrir la lección.", en: "Like a hands-on course: each module is an exercise; completion means demonstrating learning, not just opening the lesson." },
  memberships: { es: "Como revisar un contrato antes de pagar: mira precio, periodicidad, condiciones y recibo; no confundas abrir la caja con haber pagado.", en: "Like reviewing a contract before paying: check price, billing period, terms, and receipt; opening checkout is not payment." },
  "governance-identity": { es: "Como leer la misión y el reglamento de una organización: te dice qué pretende hacer y qué reglas declara, no certifica automáticamente sus resultados.", en: "Like reading an organization's mission and rules: it says what it aims to do and declares, not automatically certifies results." },
  portal: { es: "Como una recepción con varias ventanillas: identifica el trámite, ve a la ventanilla correcta y pide una confirmación del resultado.", en: "Like a reception desk with several counters: identify the task, go to the right counter, and request confirmation." },
}

const examples: Record<string, { es: string; en: string }> = {
  start: { es: "Meta: entender el mapa HCU. Acción: abrir /hcu. Evidencia: identificar un nodo y explicar qué relación muestra sin afirmar causalidad.", en: "Goal: understand the HCU map. Action: open /hcu. Evidence: identify a node and explain its relationship without claiming causation." },
  projects: { es: "Quieres colaborar en un proyecto. Antes de escribir, registra objetivo, estado declarado, evidencia enlazada y una pregunta concreta.", en: "You want to contribute to a project. Before reaching out, record its goal, declared status, linked evidence, and one concrete question." },
  research: { es: "Afirmación: «este método mejora el aprendizaje». Busca el estudio original, identifica población y método, y no generalices más allá de sus resultados.", en: "Claim: “this method improves learning.” Find the original study, identify its population and method, and do not generalize beyond its results." },
  hcu: { es: "Busca «IA + educación + territorio». Selecciona una relación, anota qué muestra el grafo y qué necesitarías investigar por separado.", en: "Search “AI + education + territory.” Select a relationship, note what the graph shows, and what you would need to investigate separately." },
  sources: { es: "Antes de citar un DOI, abre su página de destino y comprueba título, autoría, fecha y objeto asociado. Un DOI no equivale a revisión por pares.", en: "Before citing a DOI, open its landing page and check title, authorship, date, and linked object. A DOI is not peer review." },
  ecosystem: { es: "Un repositorio aparece en el catálogo. Puedes afirmar que está catalogado; no que su aplicación esté saludable sin una prueba de disponibilidad.", en: "A repository appears in the catalog. You can say it is catalogued, not that its application is healthy without an availability check." },
  developers: { es: "Antes de integrar un endpoint, comprueba método, esquema de respuesta, autorización y ejemplo reproducible; comienza con una lectura pública.", en: "Before integrating an endpoint, check method, response schema, authorization, and a reproducible example; start with a public read." },
  governance: { es: "Antes de publicar datos comunitarios, comprueba permiso, propósito, sensibilidad, responsable y proceso de retirada o corrección.", en: "Before publishing community data, check permission, purpose, sensitivity, owner, and correction or removal process." },
  community: { es: "Una propuesta útil contiene problema, evidencia, resultado esperado, alcance, riesgos y una petición concreta de revisión.", en: "A useful proposal contains a problem, evidence, expected outcome, scope, risks, and a concrete review request." },
  training: { es: "Después de un ejercicio de portafolio, guarda el resultado y anota qué criterio cumple y qué necesita mejorar.", en: "After a portfolio exercise, save the result and note which criterion it meets and what needs improvement." },
  memberships: { es: "Antes de continuar, confirma el precio, la periodicidad, las condiciones y si el checkout está habilitado. No introduzcas datos si el sistema lo bloquea.", en: "Before proceeding, confirm price, billing period, terms, and whether checkout is enabled. Do not enter details if the system blocks it." },
  "governance-identity": { es: "Si una página declara un principio de transparencia, busca cómo se evidencia en una política, un registro o un procedimiento; no lo trates como una certificación externa.", en: "If a page declares transparency, look for evidence in a policy, record, or procedure; do not treat it as external certification." },
  portal: { es: "Antes de gestionar un recurso, identifica si requiere sesión y qué confirmación devuelve. Un enlace abierto no demuestra que el trámite terminó.", en: "Before managing a resource, identify whether sign-in is required and what confirmation it returns. An opened link does not prove completion." },
}

export function TamvLearningLab({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [selectedId, setSelectedId] = useState<string>("start")
  const [level, setLevel] = useState<Level>("basic")
  const [method, setMethod] = useState<Method>("steps")
  const [checked, setChecked] = useState<string[]>([])
  const selected = useMemo(() => TAMV_LEARNING_PATHS.find((item) => item.id === selectedId) ?? TAMV_LEARNING_PATHS[0], [selectedId])
  const steps = selected[english ? "stepsEn" : "stepsEs"]
  const shownSteps = level === "basic" ? steps.slice(0, 4) : steps
  const title = english ? selected.en : selected.es
  const goal = english ? selected.goalEn : selected.goalEs
  const when = english ? selected.whenEn : selected.whenEs
  const measure = english ? selected.measureEn : selected.measureEs
  const analogy = analogies[selected.id]?.[english ? "en" : "es"] ?? ""
  const example = examples[selected.id]?.[english ? "en" : "es"] ?? ""
  const methodLabels: Record<Method, { es: string; en: string }> = {
    steps: { es: "Paso a paso", en: "Step by step" },
    analogy: { es: "Analogía cotidiana", en: "Everyday analogy" },
    example: { es: "Ejemplo aplicado", en: "Worked example" },
    checklist: { es: "Lista de comprobación", en: "Checklist" },
    teachback: { es: "Comprueba tu comprensión", en: "Check your understanding" },
  }
  const levels: Array<{ id: Level; es: string; en: string }> = [
    { id: "basic", es: "Básico", en: "Beginner" },
    { id: "intermediate", es: "Intermedio", en: "Intermediate" },
    { id: "expert", es: "Experto", en: "Expert" },
  ]

  function changeTopic(value: string) {
    setSelectedId(value)
    setChecked([])
    setMethod("steps")
  }

  return (
    <section className="section tamv-learning-lab" aria-labelledby="tamv-learning-lab-title">
      <div className="container">
        <div className="tamv-learning-heading">
          <p className="eyebrow">{english ? "GUIDED LEARNING / INTERACTIVE" : "APRENDIZAJE GUIADO / INTERACTIVO"}</p>
          <h2 id="tamv-learning-lab-title">{english ? <>Learn it your way. <em>Practice, then verify.</em></> : <>Aprende a tu manera. <em>Practica y comprueba.</em></>}</h2>
          <p>{english ? "Choose a module, learning level, and explanation method. Progress is kept only in this page session; it is not saved to your account." : "Elige un módulo, nivel y método de explicación. El avance solo se mantiene en esta página durante la sesión; no se guarda en tu cuenta."}</p>
        </div>
        <div className="tamv-learning-controls">
          <label>
            <span>{english ? "Module / section" : "Módulo / sección"}</span>
            <select value={selectedId} onChange={(event) => changeTopic(event.target.value)}>
              {TAMV_LEARNING_PATHS.map((item) => <option key={item.id} value={item.id}>{english ? item.en : item.es} — {item.route}</option>)}
            </select>
          </label>
          <fieldset>
            <legend>{english ? "Learning level" : "Nivel de aprendizaje"}</legend>
            <div className="tamv-learning-choice-row">
              {levels.map((item) => <button key={item.id} type="button" className={level === item.id ? "is-selected" : ""} aria-pressed={level === item.id} onClick={() => setLevel(item.id)}>{english ? item.en : item.es}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>{english ? "How should I explain it?" : "¿Cómo te lo explico?"}</legend>
            <div className="tamv-learning-methods">
              {(["steps", "analogy", "example", "checklist", "teachback"] as Method[]).map((item) => <button key={item} type="button" className={method === item ? "is-selected" : ""} aria-pressed={method === item} onClick={() => setMethod(item)}>{methodLabels[item][english ? "en" : "es"]}</button>)}
            </div>
          </fieldset>
        </div>
        <article className="tamv-learning-card">
          <div className="tamv-learning-card-head">
            <span className="tamv-learning-icon"><Compass aria-hidden="true" /></span>
            <div><p className="eyebrow">{english ? "YOUR LEARNING ROUTE" : "TU RUTA DE APRENDIZAJE"}</p><h3>{title}</h3></div>
            <Link href={localizedPath(selected.route, locale)} className="tamv-learning-open">{english ? "Open section" : "Abrir sección"} <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <dl className="tamv-learning-facts">
            <div><dt>{english ? "Purpose" : "Para qué sirve"}</dt><dd>{goal}</dd></div>
            <div><dt>{english ? "When to use it" : "Cuándo usarla"}</dt><dd>{when}</dd></div>
          </dl>
          {method === "analogy" ? (
            <div className="tamv-learning-method-panel"><Lightbulb aria-hidden="true" /><div><h4>{english ? "Everyday analogy" : "Analogía cotidiana"}</h4><p>{analogy}</p><p>{english ? "The analogy helps you build an intuition; use the route and evidence checks below for the real workflow." : "La analogía ayuda a construir una intuición; usa la ruta y las comprobaciones de abajo para seguir el flujo real."}</p></div></div>
          ) : null}
          {method === "example" ? (
            <div className="tamv-learning-method-panel"><Sparkles aria-hidden="true" /><div><h4>{english ? "Worked example" : "Ejemplo aplicado"}</h4><p>{example}</p></div></div>
          ) : null}
          {method === "teachback" ? (
            <div className="tamv-learning-method-panel"><CheckCircle2 aria-hidden="true" /><div><h4>{english ? "Explain it back in your own words" : "Explícalo con tus propias palabras"}</h4><p>{english ? "Without looking at the steps, can you say what this section is for, when you would use it, and what evidence confirms success? If not, choose another method or ask Isabella to guide one step at a time." : "Sin mirar los pasos, ¿puedes decir para qué sirve esta sección, cuándo la usarías y qué evidencia confirma el resultado? Si no, elige otro método o pide a Isabella que te guíe una acción a la vez."}</p><p className="tamv-learning-prompt">{english ? "Try asking Isabella: “I’m learning " : "Prueba pedirle a Isabella: «Estoy aprendiendo "}{title}{english ? ". Teach me one step at a time and change the explanation if I get stuck.”" : ". Enséñamelo de una acción a la vez y cambia la explicación si me atasco»."}</p></div></div>
          ) : null}
          {method === "steps" || method === "checklist" ? (
            <div className="tamv-learning-step-block">
              <h4>{level === "basic" ? (english ? "First actions" : "Primeras acciones") : level === "intermediate" ? (english ? "Workflow" : "Flujo de trabajo") : (english ? "Workflow and verification" : "Flujo y verificación")}</h4>
              {method === "checklist" ? (
                <ul className="tamv-learning-checklist">
                  {shownSteps.map((step, index) => <li key={step}><label><input type="checkbox" checked={checked.includes(step)} onChange={(event) => setChecked((current) => event.target.checked ? [...current, step] : current.filter((item) => item !== step))} /><span>{step}</span></label></li>)}
                </ul>
              ) : (
                <ol className="tamv-learning-steps">{shownSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
              )}
              {level !== "basic" ? <p className="tamv-learning-expert-note">{english ? "Intermediate/expert check: confirm the source, permission required, expected result, failure state, and what evidence you would retain. Do not infer that an external integration is active from a visible link." : "Comprobación intermedia/experta: confirma la fuente, el permiso requerido, el resultado esperado, el estado de error y la evidencia que conservarías. No infieras que una integración externa está activa solo porque existe un enlace."}</p> : null}
            </div>
          ) : null}
          <div className="tamv-learning-success">
            <ClipboardCheck aria-hidden="true" />
            <div><h4>{english ? "How do you know it worked?" : "¿Cómo sabes que funcionó?"}</h4><p>{measure}</p>{method === "checklist" ? <p className="tamv-learning-check-count">{english ? `${checked.length} of ${shownSteps.length} steps checked in this session.` : `${checked.length} de ${shownSteps.length} pasos marcados en esta sesión.`}</p> : null}</div>
          </div>
          <div className="tamv-learning-level-note">{level === "basic" ? (english ? "Beginner mode: focus on one goal and the first few actions. Ask for plain-language definitions." : "Nivel básico: concéntrate en una meta y las primeras acciones. Pide definiciones en lenguaje sencillo.") : level === "intermediate" ? (english ? "Intermediate mode: check dependencies, common errors, and how to verify the result." : "Nivel intermedio: revisa dependencias, errores frecuentes y cómo verificar el resultado.") : (english ? "Expert mode: document source, version, authorization, evidence, limitations, and reproducibility." : "Nivel experto: documenta fuente, versión, autorización, evidencia, límites y reproducibilidad.")}</div>
        </article>
      </div>
    </section>
  )
}
