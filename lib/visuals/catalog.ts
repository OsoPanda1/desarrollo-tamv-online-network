/**
 * Canonical catalogue of the visual layer.
 *
 * Every entry is declarative so the site can render the same composition on
 * several routes without duplicating markup. Videos and plates are generated
 * assets (see scripts/generate-visuals.mjs and scripts/generate-plates.mjs):
 * they contain no third-party footage, artwork, or embedded fonts.
 */

export type Locale = "es" | "en"

export type VideoSpec = {
  id: string
  src: string
  poster: string
  durationSeconds: number
  index: string
  titleEs: string
  titleEn: string
  summaryEs: string
  summaryEn: string
  section: string
  methodEs: string
  methodEn: string
}

export type PlateSpec = {
  id: string
  src: string
  index: string
  titleEs: string
  titleEn: string
  altEs: string
  altEn: string
  section: string
}

export type GraphSpec = {
  id: string
  kind:
    | "ecosystem-network"
    | "maturity-radar"
    | "capability-heatmap"
    | "research-timeline"
    | "proposal-funnel"
    | "hcu-topology"
    | "course-funnel"
    | "membership-bars"
    | "telemetry-latency"
    | "telemetry-memory"
    | "federation-map"
    | "provenance-chain"
  titleEs: string
  titleEn: string
  captionEs: string
  captionEn: string
  sourceEs: string
  sourceEn: string
  section: string
}

export type MindMapSpec = {
  id: string
  titleEs: string
  titleEn: string
  centerEs: string
  centerEn: string
  section: string
  branches: { labelEs: string; labelEn: string; detailEs: string; detailEn: string }[]
}

export const videos: VideoSpec[] = [
  {
    id: "01-memoria",
    src: "/visuals/videos/01-memoria.mp4",
    poster: "/visuals/posters/01-memoria.png",
    durationSeconds: 6,
    index: "01",
    titleEs: "Memoria en órbita",
    titleEn: "Memory in orbit",
    summaryEs:
      "Cápsula generativa sobre la idea de archivo vivo: capas que giran alrededor de un núcleo documental que no se congela.",
    summaryEn:
      "A generative capsule about the living archive: layers orbiting a documentary core that never freezes.",
    section: "/",
    methodEs: "Animación procedural determinista renderizada localmente con H.264. Sin material de terceros.",
    methodEn: "Deterministic procedural animation rendered locally to H.264. No third-party footage.",
  },
  {
    id: "02-estratos",
    src: "/visuals/videos/02-estratos.mp4",
    poster: "/visuals/posters/02-estratos.png",
    durationSeconds: 6,
    index: "02",
    titleEs: "Estratos de infraestructura",
    titleEn: "Infrastructure strata",
    summaryEs:
      "Capas técnicas que se desplazan sin perder la línea: contrato, adaptador, prueba y operación.",
    summaryEn:
      "Technical layers that shift without losing the line: contract, adapter, test, and operation.",
    section: "/arquitectura",
    methodEs: "Animación procedural determinista. Cada línea se calcula con una semilla fija y es reproducible.",
    methodEn: "Deterministic procedural animation. Each line is computed from a fixed seed and is reproducible.",
  },
  {
    id: "03-reticula",
    src: "/visuals/videos/03-reticula.mp4",
    poster: "/visuals/posters/03-reticula.png",
    durationSeconds: 6,
    index: "03",
    titleEs: "Retícula de ecosistema",
    titleEn: "Ecosystem lattice",
    summaryEs:
      "Nodos documentados y enlaces verificables. La retícula muestra responsabilidades, no promesas de integración.",
    summaryEn:
      "Documented nodes and verifiable links. The lattice shows responsibilities, not integration promises.",
    section: "/ecosistema",
    methodEs: "Animación procedural determinista. La retícula no representa servicios en vivo ni disponibilidad.",
    methodEn: "Deterministic procedural animation. The lattice does not represent live services or uptime.",
  },
  {
    id: "04-ondas",
    src: "/visuals/videos/04-ondas.mp4",
    poster: "/visuals/posters/04-ondas.png",
    durationSeconds: 6,
    index: "04",
    titleEs: "Interferencia de conocimiento",
    titleEn: "Knowledge interference",
    summaryEs:
      "Series que se cruzan: preguntas abiertas, evidencia y revisión. El cruce es el método, no el adorno.",
    summaryEn:
      "Series that cross: open questions, evidence, and review. The crossing is the method, not the decoration.",
    section: "/investigacion",
    methodEs: "Animación procedural determinista. No se presenta como dato medido.",
    methodEn: "Deterministic procedural animation. Not presented as measured data.",
  },
  {
    id: "05-helice",
    src: "/visuals/videos/05-helice.mp4",
    poster: "/visuals/posters/05-helice.png",
    durationSeconds: 6,
    index: "05",
    titleEs: "Hélice de trazabilidad",
    titleEn: "Traceability helix",
    summaryEs:
      "Dos hebras: identidad y procedencia. Los travesaños son eventos que pueden recomputarse.",
    summaryEn:
      "Two strands: identity and provenance. The rungs are events that can be recomputed.",
    section: "/hcu",
    methodEs: "Animación procedural determinista. La hélice es una metáfora visual, no un registro de eventos.",
    methodEn: "Deterministic procedural animation. The helix is a visual metaphor, not an event log.",
  },
  {
    id: "06-flujo",
    src: "/visuals/videos/06-flujo.mp4",
    poster: "/visuals/posters/06-flujo.png",
    durationSeconds: 6,
    index: "06",
    titleEs: "Flujo comunitario",
    titleEn: "Community flow",
    summaryEs:
      "Partículas que se orientan por un campo común. La comunidad aparece como coordinación, no como masa.",
    summaryEn:
      "Particles steered by a shared field. Community appears as coordination, not as a crowd.",
    section: "/comunidad",
    methodEs: "Animación procedural determinista con estelas acumuladas en memoria durante el render.",
    methodEn: "Deterministic procedural animation with trails accumulated in memory during the render.",
  },
  {
    id: "07-espectro",
    src: "/visuals/videos/07-espectro.mp4",
    poster: "/visuals/posters/07-espectro.png",
    durationSeconds: 6,
    index: "07",
    titleEs: "Espectro de observabilidad",
    titleEn: "Observability spectrum",
    summaryEs:
      "Un instrumento que se abre en lecturas. Ninguna barra es una métrica real: la telemetría real está etiquetada aparte.",
    summaryEn:
      "An instrument that opens into readings. No bar is a real metric: real telemetry is labelled separately.",
    section: "/isabella",
    methodEs: "Animación procedural determinista. No sustituye al panel de observabilidad en vivo.",
    methodEn: "Deterministic procedural animation. It does not replace the live observability panel.",
  },
  {
    id: "08-constelacion",
    src: "/visuals/videos/08-constelacion.mp4",
    poster: "/visuals/posters/08-constelacion.png",
    durationSeconds: 6,
    index: "08",
    titleEs: "Constelación de continuidad",
    titleEn: "Constellation of continuity",
    summaryEs:
      "Trazos que se completan con el tiempo: una hoja de ruta que se dibuja al caminarla.",
    summaryEn:
      "Lines completed over time: a roadmap drawn as it is walked.",
    section: "/institucionalizacion",
    methodEs: "Animación procedural determinista con revelado progresivo por tiempo.",
    methodEn: "Deterministic procedural animation with time-based progressive reveal.",
  },
]

const plate = (
  index: string,
  id: string,
  titleEs: string,
  titleEn: string,
  section: string,
): PlateSpec => ({
  id,
  src: `/visuals/plates/${id}.svg`,
  index,
  titleEs,
  titleEn,
  altEs: `Placa editorial «${titleEs}»: composición geométrica generada por TAMV, sin material de terceros.`,
  altEn: `Editorial plate “${titleEn}”: geometric composition generated by TAMV, with no third-party material.`,
  section,
})

export const plates: PlateSpec[] = [
  plate("01", "01-memoria-territorial", "Memoria territorial", "Territorial memory", "/"),
  plate("02", "02-infraestructura-digital", "Infraestructura digital", "Digital infrastructure", "/arquitectura"),
  plate("03", "03-inteligencia-hibrida", "Inteligencia híbrida", "Hybrid intelligence", "/isabella"),
  plate("04", "04-gobernanza", "Gobernanza", "Governance", "/gobernanza"),
  plate("05", "05-investigacion-abierta", "Investigación abierta", "Open research", "/investigacion"),
  plate("06", "06-hcu", "Mapa HCU", "HCU map", "/hcu"),
  plate("07", "07-ecosistema", "Ecosistema", "Ecosystem", "/ecosistema"),
  plate("08", "08-formacion", "Formación", "Learning", "/formacion"),
  plate("09", "09-membresias", "Membresías", "Memberships", "/membresias"),
  plate("10", "10-comunidad", "Comunidad", "Community", "/comunidad"),
  plate("11", "11-desarrolladores", "Desarrolladores", "Developers", "/desarrolladores"),
  plate("12", "12-trazabilidad", "Trazabilidad", "Traceability", "/excelencia"),
  plate("13", "13-procedencia", "Procedencia", "Provenance", "/fuentes"),
  plate("14", "14-consentimiento", "Consentimiento", "Consent", "/utamv"),
  plate("15", "15-observabilidad", "Observabilidad", "Observability", "/atlas"),
  plate("16", "16-federacion", "Federación", "Federation", "/investigadores"),
  plate("17", "17-publicaciones", "Publicaciones", "Publications", "/investigacion/publicaciones"),
  plate("18", "18-investigadores", "Investigadores", "Researchers", "/investigadores"),
  plate("19", "19-isabella", "Isabella", "Isabella", "/isabella"),
  plate("20", "20-utamv", "UTAMV", "UTAMV", "/utamv"),
]

const graph = (
  id: string,
  kind: GraphSpec["kind"],
  section: string,
  titleEs: string,
  titleEn: string,
  captionEs: string,
  captionEn: string,
  sourceEs = "Datos declarados a partir del inventario documental del repositorio.",
  sourceEn = "Declared data derived from the repository's documentary inventory.",
): GraphSpec => ({
  id,
  kind,
  titleEs,
  titleEn,
  captionEs,
  captionEn,
  sourceEs,
  sourceEn,
  section,
})

export const graphs: GraphSpec[] = [
  graph(
    "g01-ecosistema",
    "ecosystem-network",
    "/ecosistema",
    "Red de responsabilidades",
    "Responsibility network",
    "Sistemas del ecosistema unidos por la capacidad que comparten. Un enlace no implica integración en vivo.",
    "Ecosystem systems joined by shared capability. A link does not imply live integration.",
  ),
  graph(
    "g02-madurez",
    "maturity-radar",
    "/proyectos",
    "Madurez declarada por proyecto",
    "Declared maturity by project",
    "Cada eje resume el estado declarado de un proyecto; no es una auditoría independiente.",
    "Each axis summarises a project's declared state; it is not an independent audit.",
  ),
  graph(
    "g03-capacidades",
    "capability-heatmap",
    "/arquitectura",
    "Matriz de capacidades",
    "Capability matrix",
    "Qué capacidad está catalogada, contratada o probada. El vacío también informa.",
    "Which capability is catalogued, contracted, or tested. Gaps also inform.",
  ),
  graph(
    "g04-investigacion",
    "research-timeline",
    "/investigacion",
    "Línea de tiempo del inventario",
    "Inventory timeline",
    "Registros por año según el inventario declarado. No mide impacto ni citas.",
    "Records per year from the declared inventory. It does not measure impact or citations.",
  ),
  graph(
    "g05-propuestas",
    "proposal-funnel",
    "/gobernanza",
    "Embudo de propuestas",
    "Proposal funnel",
    "Recuento agregado de propuestas por estado editorial. Sin datos personales.",
    "Aggregate count of proposals by editorial state. No personal data.",
  ),
  graph(
    "g06-hcu",
    "hcu-topology",
    "/hcu",
    "Topología de hipervínculos",
    "Hyperedge topology",
    "Esquema de dominios, átomos e hiperaristas. Es una lectura estructural, no una simulación.",
    "Schematic of domains, atoms, and hyperedges. A structural reading, not a simulation.",
  ),
  graph(
    "g07-formacion",
    "course-funnel",
    "/formacion",
    "Ruta de módulos",
    "Module path",
    "Seis módulos con avance secuencial. El acceso se valida en el servidor.",
    "Six modules with sequential progress. Access is validated on the server.",
  ),
  graph(
    "g08-membresias",
    "membership-bars",
    "/membresias",
    "Planes y límites",
    "Plans and limits",
    "Precios y moneda tomados del catálogo de planes del código, no de una campaña.",
    "Prices and currency taken from the code's plan catalogue, not from a campaign.",
  ),
  graph(
    "g09-latencia",
    "telemetry-latency",
    "/atlas",
    "Latencia de sonda en vivo",
    "Live probe latency",
    "Medición real de esta instancia contra PostgreSQL. Ventana corta, sin histórico.",
    "Real measurement from this instance against PostgreSQL. Short window, no history.",
  ),
  graph(
    "g10-memoria",
    "telemetry-memory",
    "/atlas",
    "Memoria del proceso",
    "Process memory",
    "RSS del proceso Node de esta instancia. No representa el total de la plataforma.",
    "RSS of this instance's Node process. It does not represent the whole platform.",
  ),
  graph(
    "g11-federacion",
    "federation-map",
    "/investigadores",
    "Mapa de federación",
    "Federation map",
    "Nodos federados y estado declarado. La federación no está activa en producción.",
    "Federated nodes and declared state. Federation is not active in production.",
  ),
  graph(
    "g12-procedencia",
    "provenance-chain",
    "/excelencia",
    "Cadena de procedencia",
    "Provenance chain",
    "Eventos encadenados por hash. Recomputar la cadena es la prueba, no la etiqueta.",
    "Events chained by hash. Recomputing the chain is the proof, not the label.",
  ),
]

const mindMap = (
  id: string,
  section: string,
  centerEs: string,
  centerEn: string,
  titleEs: string,
  titleEn: string,
  branches: [string, string, string, string][],
): MindMapSpec => ({
  id,
  section,
  titleEs,
  titleEn,
  centerEs,
  centerEn,
  branches: branches.map(([labelEs, labelEn, detailEs, detailEn]) => ({ labelEs, labelEn, detailEs, detailEn })),
})

export const mindMaps: MindMapSpec[] = [
  mindMap("m01-investigacion", "/investigacion", "Investigación abierta", "Open research", "Mapa mental de investigación", "Research mind map", [
    ["Pregunta", "Question", "Una pregunta acotada y verificable antes de cualquier promesa.", "A bounded, verifiable question before any promise."],
    ["Evidencia", "Evidence", "Fuente, versión, licencia y límite declarados.", "Declared source, version, licence, and limitation."],
    ["Revisión", "Review", "Pares o moderación registrada; nunca una respuesta de modelo.", "Recorded peer or moderator review; never a model answer."],
    ["Datos", "Data", "Minimización, consentimiento y caducidad.", "Minimisation, consent, and expiry."],
    ["Publicación", "Publication", "Estado editorial explícito y exportable.", "Explicit, exportable editorial state."],
    ["Réplica", "Replication", "Lo que no se puede repetir se marca como no replicado.", "What cannot be repeated is marked as not replicated."],
  ]),
  mindMap("m02-arquitectura", "/arquitectura", "Arquitectura", "Architecture", "Mapa mental de arquitectura", "Architecture mind map", [
    ["Contrato", "Contract", "Entradas, salidas y errores antes del adaptador.", "Inputs, outputs, and errors before the adapter."],
    ["Adaptador", "Adapter", "Una frontera por sistema, con límites de autoridad.", "One boundary per system, with authority limits."],
    ["Prueba", "Test", "Contrato probado antes de declarar integración.", "Contract tested before declaring integration."],
    ["Operación", "Operation", "Salud, presupuesto y degradación declarada.", "Health, budget, and declared degradation."],
    ["Datos", "Data", "Propiedad, retención y exportación.", "Ownership, retention, and export."],
    ["Riesgo", "Risk", "Dependencia externa y plan de salida.", "External dependency and exit plan."],
  ]),
  mindMap("m03-gobernanza", "/gobernanza", "Gobernanza", "Governance", "Mapa mental de gobernanza", "Governance mind map", [
    ["Misión", "Mission", "Investigar y documentar con responsabilidad.", "Research and document responsibly."],
    ["Decisión", "Decision", "Quién decide, cómo y con qué registro.", "Who decides, how, and with what record."],
    ["Conflicto", "Conflict", "Recusación y separación de funciones.", "Recusal and separation of duties."],
    ["Apelación", "Appeal", "Toda decisión editorial admite revisión.", "Every editorial decision allows review."],
    ["Transparencia", "Transparency", "Estados y límites visibles.", "Visible states and limits."],
    ["Continuidad", "Continuity", "Sucesión y custodia documentadas.", "Documented succession and custody."],
  ]),
  mindMap("m04-hcu", "/hcu", "Modelo HCU", "HCU model", "Mapa mental del modelo HCU", "HCU model mind map", [
    ["Dominio", "Domain", "Agrupa preguntas y límites de un campo.", "Groups questions and limits of a field."],
    ["Átomo", "Atom", "Unidad mínima con evidencia y cuarentena.", "Smallest unit with evidence and quarantine."],
    ["Hiperarista", "Hyperedge", "Relación entre varios átomos.", "Relation across several atoms."],
    ["Shock", "Shock", "Perturbación declarada y acotada.", "Declared and bounded perturbation."],
    ["Simulación", "Simulation", "Resultado determinista por semilla.", "Deterministic result per seed."],
    ["Exportación", "Export", "JSON-LD con método y límites.", "JSON-LD with method and limits."],
  ]),
  mindMap("m05-ecosistema", "/ecosistema", "Ecosistema", "Ecosystem", "Mapa mental del ecosistema", "Ecosystem mind map", [
    ["Registro", "Registry", "Un catálogo canónico, sin secretos.", "One canonical catalogue, no secrets."],
    ["Estado", "State", "Catalogado no es verificado.", "Catalogued is not verified."],
    ["Capacidad", "Capability", "Lo que el sistema puede hacer hoy.", "What the system can do today."],
    ["Prohibición", "Prohibition", "Supuestos que no se permiten.", "Assumptions that are not allowed."],
    ["Metadatos", "Metadata", "Contrato público y exportable.", "Public, exportable contract."],
    ["Federación", "Federation", "Interoperar sin fusionar identidades.", "Interoperate without merging identities."],
  ]),
  mindMap("m06-formacion", "/formacion", "Formación", "Learning", "Mapa mental de formación", "Learning mind map", [
    ["Perfil", "Profile", "Qué sabe hacer la persona al terminar.", "What the person can do at the end."],
    ["Práctica", "Practice", "Entregables, no solo lecturas.", "Deliverables, not only readings."],
    ["Evaluación", "Assessment", "Criterios explícitos y reproducibles.", "Explicit, reproducible criteria."],
    ["Evidencia", "Evidence", "Portafolio y registro de avance.", "Portfolio and progress record."],
    ["Acceso", "Access", "Membresía activa validada en servidor.", "Active membership validated server-side."],
    ["Límite", "Limit", "No se promete acreditación oficial.", "No official accreditation is promised."],
  ]),
  mindMap("m07-excelencia", "/excelencia", "Excelencia", "Excellence", "Mapa mental de excelencia", "Excellence mind map", [
    ["Método", "Method", "Un método documentado, no una patente.", "A documented method, not a patent."],
    ["Trazabilidad", "Traceability", "Hash, versión y autor.", "Hash, version, and author."],
    ["Revision", "Review", "Revisión registrada y fechada.", "Recorded, dated review."],
    ["Replica", "Replication", "Condiciones para repetir el resultado.", "Conditions to repeat the result."],
    ["Límite", "Limit", "Lo no verificado se declara.", "The unverified is declared."],
    ["Custodia", "Custody", "Quién conserva y por cuánto tiempo.", "Who keeps it and for how long."],
  ]),
  mindMap("m08-comunidad", "/comunidad", "Comunidad", "Community", "Mapa mental de comunidad", "Community mind map", [
    ["Participar", "Participate", "Intereses y propuestas con consentimiento.", "Interests and proposals with consent."],
    ["Cuidar", "Care", "Moderación y apelación.", "Moderation and appeal."],
    ["Aprender", "Learn", "Rutas y práctica guiada.", "Paths and guided practice."],
    ["Construir", "Build", "API pública y contribución acotada.", "Public API and scoped contribution."],
    ["Reconocer", "Recognise", "Insignias por acciones reales.", "Badges for real actions."],
    ["Sostener", "Sustain", "Apoyo transparente, sin promesas.", "Transparent support, no promises."],
  ]),
]

export type SectionVisuals = {
  video?: VideoSpec
  plate?: PlateSpec
  graphs?: GraphSpec[]
  mindMap?: MindMapSpec
}

const byId = <T extends { id: string }>(list: T[], id: string): T => {
  const found = list.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown visual asset: ${id}`)
  return found
}

export const sectionVisuals: Record<string, SectionVisuals> = {
  "/": { video: byId(videos, "01-memoria"), plate: byId(plates, "01-memoria-territorial") },
  "/arquitectura": {
    video: byId(videos, "02-estratos"),
    plate: byId(plates, "02-infraestructura-digital"),
    graphs: [byId(graphs, "g03-capacidades")],
    mindMap: byId(mindMaps, "m02-arquitectura"),
  },
  "/ecosistema": {
    video: byId(videos, "03-reticula"),
    plate: byId(plates, "07-ecosistema"),
    graphs: [byId(graphs, "g01-ecosistema")],
    mindMap: byId(mindMaps, "m05-ecosistema"),
  },
  "/investigacion": {
    video: byId(videos, "04-ondas"),
    plate: byId(plates, "05-investigacion-abierta"),
    graphs: [byId(graphs, "g04-investigacion")],
    mindMap: byId(mindMaps, "m01-investigacion"),
  },
  "/hcu": {
    video: byId(videos, "05-helice"),
    plate: byId(plates, "06-hcu"),
    graphs: [byId(graphs, "g06-hcu")],
    mindMap: byId(mindMaps, "m04-hcu"),
  },
  "/comunidad": { video: byId(videos, "06-flujo"), plate: byId(plates, "10-comunidad"), mindMap: byId(mindMaps, "m08-comunidad") },
  "/isabella": { video: byId(videos, "07-espectro"), plate: byId(plates, "03-inteligencia-hibrida") },
  "/institucionalizacion": { video: byId(videos, "08-constelacion"), plate: byId(plates, "20-utamv") },
  "/gobernanza": {
    plate: byId(plates, "04-gobernanza"),
    graphs: [byId(graphs, "g05-propuestas")],
    mindMap: byId(mindMaps, "m03-gobernanza"),
  },
  "/proyectos": { plate: byId(plates, "01-memoria-territorial"), graphs: [byId(graphs, "g02-madurez")] },
  "/membresias": { plate: byId(plates, "09-membresias"), graphs: [byId(graphs, "g08-membresias")] },
  "/formacion": { plate: byId(plates, "08-formacion"), graphs: [byId(graphs, "g07-formacion")] },
  "/desarrolladores": { plate: byId(plates, "11-desarrolladores") },
  "/excelencia": { plate: byId(plates, "12-trazabilidad"), graphs: [byId(graphs, "g12-procedencia")], mindMap: byId(mindMaps, "m07-excelencia") },
  "/fuentes": { plate: byId(plates, "13-procedencia") },
  "/investigadores": { plate: byId(plates, "16-federacion"), graphs: [byId(graphs, "g11-federacion")] },
  "/investigacion/publicaciones": { plate: byId(plates, "17-publicaciones") },
  "/utamv": { plate: byId(plates, "14-consentimiento") },
  "/apoyar": { plate: byId(plates, "10-comunidad") },
  "/guia": { plate: byId(plates, "08-formacion") },
  "/atlas": {
    plate: byId(plates, "15-observabilidad"),
    graphs: [byId(graphs, "g09-latencia"), byId(graphs, "g10-memoria")],
  },
}

export function visualsFor(pathname: string): SectionVisuals {
  return sectionVisuals[pathname] ?? {}
}
