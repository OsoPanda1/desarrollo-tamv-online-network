export type ProjectCategory = "architecture" | "ai" | "academia" | "territory"

export type ProjectFilter = "all" | ProjectCategory

export const projectFilters: ProjectFilter[] = ["all", "architecture", "ai", "academia", "territory"]

export const projectFilterLabels: Record<ProjectFilter, string> = {
  all: "Todos",
  architecture: "Arquitectura",
  ai: "IA",
  academia: "Academia",
  territory: "Territorio",
}

export const researchInventory = {
  platforms: 100,
  capabilities: 500,
  categories: 10,
}

export const governancePrinciples = [
  {
    number: "01",
    title: "Procedencia",
    titleEn: "Provenance",
    text: "Identificar fuente, autoría, versión, fecha y licencia de cada artefacto.",
    textEn: "Identify each artifact's source, authorship, version, date, and license.",
  },
  {
    number: "02",
    title: "Método reproducible",
    titleEn: "Reproducible method",
    text: "Describir pruebas, condiciones de ejecución, límites y resultados observables.",
    textEn: "Describe tests, execution conditions, limitations, and observable results.",
  },
  {
    number: "03",
    title: "Revisión humana",
    titleEn: "Human review",
    text: "Mantener responsables identificables, revisión independiente y vías de corrección.",
    textEn: "Keep accountable people identifiable, with independent review and ways to correct errors.",
  },
  {
    number: "04",
    title: "Afirmaciones proporcionales",
    titleEn: "Proportionate claims",
    text: "Distinguir con claridad propuesta, prototipo, operación y validación externa.",
    textEn: "Clearly distinguish proposals, prototypes, operations, and external validation.",
  },
]

export const roadmapSteps = [
  {
    phase: "01",
    title: "Hacer verificable la base",
    titleEn: "Make the foundation verifiable",
    text: "Ordenar fuentes, versiones, licencias e identificadores y documentar qué está disponible hoy.",
    textEn: "Organize sources, versions, licenses, and identifiers; document what is available today.",
  },
  {
    phase: "02",
    title: "Probar un caso acotado",
    titleEn: "Test a bounded use case",
    text: "Definir un piloto medible y someter arquitectura, seguridad y resultados a revisión técnica independiente.",
    textEn: "Define a measurable pilot and subject its architecture, security, and results to independent technical review.",
  },
  {
    phase: "03",
    title: "Abrir colaboración y gobernanza",
    titleEn: "Open collaboration and governance",
    text: "Establecer reglas transparentes de participación, revisión, apelación y representación comunitaria.",
    textEn: "Set transparent rules for participation, review, appeals, and community representation.",
  },
  {
    phase: "04",
    title: "Escalar con evidencia",
    titleEn: "Scale with evidence",
    text: "Ampliar interoperabilidad y alianzas solo cuando capacidad, sostenibilidad e impacto puedan demostrarse.",
    textEn: "Expand interoperability and partnerships only when capability, sustainability, and impact can be demonstrated.",
  },
]

/**
 * Contenido portado del hub HTML (Fase 0, 2026-11-23).
 * Todo el contenido nuevo es bilingüe ES/EN. Las etiquetas de estado son
 * las del hub, no pruebas de despliegue ni de validación externa.
 * "Autocurativo" e "inalterable" se usan en el hub como objetivos
 * arquitectónicos, nunca como propiedades absolutas.
 */

export const enterpriseManifesto = {
  statement: "No construyo una marca. Construyo una infraestructura civilizatoria.",
  statementEn: "I am not building a brand. I am building a civilizational infrastructure.",
  intro:
    "TAMV Online Enterprise es un ecosistema de raíz territorial orientado a infraestructura digital soberana, memoria histórica operacional, IA gobernada y coordinación comunitaria autónoma. No es un portafolio ni una vitrina: es un sistema vivo, operativo, resiliente y observable.",
  introEn:
    "TAMV Online Enterprise is a territorially rooted ecosystem oriented toward sovereign digital infrastructure, operational historical memory, governed AI, and autonomous community coordination. It is not a portfolio or a showcase: it is a living, operating, resilient, and observable system.",
  originTitle: "Orgullosamente realmontense. No como etiqueta: como responsabilidad.",
  originTitleEn: "Proudly from Real del Monte. Not as a label: as a responsibility.",
  originText:
    "TAMV nace desde un territorio concreto y una experiencia concreta: la de una comunidad que trabaja, resuelve, emprende, crea e innova diariamente para sostener la vida. Durante más de cuatro décadas se sostuvo que nuestras latitudes estaban confinadas a ser consumidoras pasivas de arquitecturas diseñadas en otros centros de poder. TAMV responde construyendo capacidad propia: no desde la imitación, sino desde la investigación, la documentación, la ingeniería y la colaboración territorial.",
  originTextEn:
    "TAMV is born from a concrete territory and a concrete experience: that of a community that works, solves, undertakes, creates, and innovates every day to sustain life. For more than four decades it was held that our latitudes were confined to being passive consumers of architectures designed in other centers of power. TAMV responds by building its own capacity: not from imitation, but from research, documentation, engineering, and territorial collaboration.",
  dedicationTitle: "Es un proyecto dedicado a:",
  dedicationTitleEn: "This project is dedicated to:",
  dedication: [
    { title: "A los barrios", titleEn: "To the neighborhoods", detail: "y a las raíces históricas", detailEn: "and to their historical roots" },
    { title: "A la memoria local", titleEn: "To local memory", detail: "que merece infraestructura, no olvido", detailEn: "which deserves infrastructure, not oblivion" },
    { title: "A comerciantes y familias trabajadoras", titleEn: "To merchants and working families", detail: "que sostienen la vida cotidiana", detailEn: "who sustain everyday life" },
    { title: "A quienes innovan sin reconocimiento formal", titleEn: "To those who innovate without formal recognition", detail: "y construyen con recursos limitados", detailEn: "and build with limited resources" },
    { title: "A quienes luchan por llevar comida a sus mesas", titleEn: "To those who struggle to put food on their tables", detail: "la tecnología también les debe responder", detailEn: "technology owes them an answer too" },
    { title: "A quienes quieren futuro digital sin renunciar a su identidad", titleEn: "To those who want a digital future without giving up their identity", detail: "participar sin dejar de ser", detailEn: "to participate without ceasing to be" },
    { title: "Al territorio que inspira", titleEn: "To the territory that inspires", detail: "la tecnología rinde cuentas ante él", detailEn: "technology is accountable to it" },
    { title: "A la capacidad propia", titleEn: "To our own capacity", detail: "investigar, documentar, ingeniar, colaborar", detailEn: "research, document, engineer, collaborate" },
  ],
  autonomyCriterionTitle: "Si no genera capacidad real, no tiene legitimidad aquí.",
  autonomyCriterionTitleEn: "If it does not generate real capacity, it has no legitimacy here.",
  autonomyCriterionText:
    "Si un sistema no genera capacidad real, autonomía operativa, viabilidad comunitaria o memoria técnica accesible, carece de legitimidad dentro del ecosistema. El rechazo institucional o mercantil no destruye la visión: la vuelve más rigurosa, auditable y exigente.",
  autonomyCriterionTextEn:
    "If a system does not generate real capacity, operational autonomy, community viability, or accessible technical memory, it lacks legitimacy within the ecosystem. Institutional or market rejection does not destroy the vision: it makes it more rigorous, auditable, and demanding.",
  designCommitmentTitle: "La comunidad no es una fuente pasiva de datos.",
  designCommitmentTitleEn: "The community is not a passive source of data.",
  designCommitmentText:
    "TAMV busca herramientas mediante las cuales el territorio pueda comprender, gobernar, preservar y utilizar sus propios activos digitales. Su legitimidad no viene de la retórica, sino de convertir principios en sistemas operativos, contratos verificables, documentación, pruebas, despliegues y servicios útiles.",
  designCommitmentTextEn:
    "TAMV seeks tools through which the territory can understand, govern, preserve, and use its own digital assets. Its legitimacy does not come from rhetoric, but from turning principles into operating systems, verifiable contracts, documentation, tests, deployments, and useful services.",
  caution:
    "“Autocurativo” e “inalterable” se usan como objetivos arquitectónicos — detección, contención y reparación bajo reglas, e integridad mediante acceso, versionado, hashes y auditoría — nunca como propiedades absolutas sin evidencia técnica.",
  cautionEn:
    "“Self-healing” and “unalterable” are used as architectural objectives — detection, containment, and repair under rules, and integrity through access control, versioning, hashes, and audit — never as absolute properties without technical evidence.",
}

export const enterpriseAxioms = [
  {
    number: "01",
    title: "Soberanía de datos",
    titleEn: "Data sovereignty",
    text: "Si los datos no conservan soberanía en su lugar de origen, la memoria colectiva se degrada en extractivismo digital.",
    textEn: "If data does not retain sovereignty at its place of origin, collective memory degrades into digital extractivism.",
  },
  {
    number: "02",
    title: "Inteligencia territorial",
    titleEn: "Territorial intelligence",
    text: "Si la IA no sirve a las dinámicas vivas del territorio, se convierte en ruido sintético automatizado.",
    textEn: "If AI does not serve the living dynamics of the territory, it becomes automated synthetic noise.",
  },
  {
    number: "03",
    title: "Resiliencia operativa",
    titleEn: "Operational resilience",
    text: "Si un sistema no puede sobrevivir, degradarse con elegancia y recuperarse de sus fallas, no ha alcanzado madurez arquitectónica.",
    textEn: "If a system cannot survive, degrade gracefully, and recover from its failures, it has not reached architectural maturity.",
  },
  {
    number: "04",
    title: "Trazabilidad causal",
    titleEn: "Causal traceability",
    text: "Si una decisión técnica o algorítmica no puede reconstruirse punto por punto, la infraestructura carece de memoria.",
    textEn: "If a technical or algorithmic decision cannot be reconstructed point by point, the infrastructure lacks memory.",
  },
  {
    number: "05",
    title: "Autonomía cognitiva",
    titleEn: "Cognitive autonomy",
    text: "Si una comunidad no puede auditar, comprender ni cuestionar el código que influye en su entorno, la tecnología reproduce subordinación.",
    textEn: "If a community cannot audit, understand, or question the code that shapes its environment, technology reproduces subordination.",
  },
]

export const enterpriseCentralQuestion = {
  title: "¿Cómo se diseña una plataforma que piense como territorio, resista como sistema y evolucione como organismo?",
  titleEn: "How do you design a platform that thinks like a territory, endures like a system, and evolves like an organism?",
  text: "Esta interrogante guía la especificación del kernel, la jerarquía de almacenamiento, la gobernanza algorítmica, la observabilidad distribuida y el equilibrio entre automatización e inteligencia humana.",
  textEn: "This question guides the specification of the kernel, the storage hierarchy, algorithmic governance, distributed observability, and the balance between automation and human intelligence.",
}

export const runtimeMatrix = [
  {
    component: "MD-X4",
    layer: "Kernel / Federación",
    layerEn: "Kernel / Federation",
    role: "Coordinación de nodos federados, contratos API, políticas, orquestación y control de fallos.",
    roleEn: "Coordination of federated nodes, API contracts, policies, orchestration, and failure control.",
    status: "Active",
  },
  {
    component: "RDM-TOS",
    layer: "Sistema operativo territorial",
    layerEn: "Territorial operating system",
    role: "Gestión de datos contextuales, expedientes, eventos, alertas y memoria operacional local.",
    roleEn: "Management of contextual data, records, events, alerts, and local operational memory.",
    status: "Active",
  },
  {
    component: "Isabella AI",
    layer: "Cognición / Agentes",
    layerEn: "Cognition / Agents",
    role: "IA gobernada, recuperación contextual, resolución de incertidumbre, procedencia y skills.",
    roleEn: "Governed AI, contextual retrieval, uncertainty resolution, provenance, and skills.",
    status: "Genesis",
  },
  {
    component: "MSR / BookPI",
    layer: "Memoria / Auditoría",
    layerEn: "Memory / Audit",
    role: "Grafo de trazabilidad que relaciona decisiones, código, evidencia, pruebas y despliegues.",
    roleEn: "Traceability graph linking decisions, code, evidence, tests, and deployments.",
    status: "Active",
  },
  {
    component: "TAMV Network",
    layer: "Interfaz / Red",
    layerEn: "Interface / Network",
    role: "Interacción pública, servicios federados, experiencias XR/multimedia y colaboración.",
    roleEn: "Public interaction, federated services, XR/multimedia experiences, and collaboration.",
    status: "Active",
  },
]

export const runtimeMatrixNote = {
  text: "Los estados son etiquetas operativas y deben actualizarse únicamente con evidencia: releases, pruebas, documentación, despliegues o registros BookPI.",
  textEn: "Statuses are operational labels and must be updated only with evidence: releases, tests, documentation, deployments, or BookPI records.",
}

export const founderProfile = {
  name: "Edwin Oswaldo Castillo Trejo",
  alias: "Anubis Villaseñor",
  aliasNote: "“El Oso” en su tierra.",
  aliasNoteEn: "“El Oso” in his homeland.",
  role: "CEO Fundador de TAMV Online Network",
  roleEn: "Founding CEO of TAMV Online Network",
  roleDetail: "Fundador y CEO · Arquitecto Jefe",
  roleDetailEn: "Founder and CEO · Chief Architect",
  place: "Real del Monte, Hidalgo, México",
  bio: "Investigador independiente y arquitecto de infraestructura digital soberana, autodidacta: construyó sin permisos institucionales y verificó en abierto. Desde Mineral del Monte articula sistemas federados, criptografía poscuántica, gobernanza algorítmica y ética de la IA en un marco unificado. Es rector fundador de UTAMV Campus Online, creador de Isabella Villaseñor AI y autor del Documento Magno Canónico.",
  bioEn:
    "Independent researcher and architect of sovereign digital infrastructure, self-taught: he built without institutional permission and verified in the open. From Mineral del Monte he articulates federated systems, post-quantum cryptography, algorithmic governance, and AI ethics in a unified framework. He is founding rector of UTAMV Campus Online, creator of Isabella Villaseñor AI, and author of the Canonical Magna Document.",
  motto: "No acumula datos: teje memoria, contexto y responsabilidad.",
  mottoEn: "He does not accumulate data: he weaves memory, context, and responsibility.",
  orcid: "0009-0008-5050-1539",
  orcidUrl: "https://orcid.org/0009-0008-5050-1539",
  isni: "0000000531699229",
  loopId: "3117809",
  github: "OsoPanda1",
  githubUrl: "https://github.com/OsoPanda1",
  guidingPrinciple:
    "La evidencia debe preceder al claim; la autoridad humana debe permanecer por encima de la capacidad computacional.",
  guidingPrincipleEn:
    "Evidence must precede the claim; human authority must remain above computational capacity.",
  tinaName: "TINA (Trusted Intelligence, Native & Adaptive)",
  tinaDescription:
    "Arquitectura experimental de IA gobernada, concebida como cognitive gateway entre solicitudes humanas y capacidades de inferencia, memoria, herramientas, aprendizaje y ejecución — con controles de identidad, revisión humana integrada, aislamiento multi-tenant, trazabilidad y procedencia de datos, inspección de salida, contexto territorial, observabilidad y degradación explícita.",
  tinaDescriptionEn:
    "An experimental governed-AI architecture, conceived as a cognitive gateway between human requests and inference, memory, tooling, learning, and execution capabilities — with identity controls, integrated human review, multi-tenant isolation, traceability and data provenance, output inspection, territorial context, observability, and explicit degradation.",
  tinaFunctions: [
    { number: "01", title: "Capacidad", titleEn: "Capability", text: "Lo que el sistema puede hacer.", textEn: "What the system can do." },
    { number: "02", title: "Autoridad", titleEn: "Authority", text: "Quién decide.", textEn: "Who decides." },
    { number: "03", title: "Ejecución", titleEn: "Execution", text: "Qué se realiza.", textEn: "What is carried out." },
    { number: "04", title: "Evidencia", titleEn: "Evidence", text: "Qué se documenta.", textEn: "What is documented." },
    { number: "05", title: "Aprendizaje", titleEn: "Learning", text: "Qué se incorpora.", textEn: "What is incorporated." },
    { number: "06", title: "Producción", titleEn: "Production", text: "Qué se entrega.", textEn: "What is delivered." },
  ],
  identifiersNote:
    "Identificadores tal como se declaran en el Documento Maestro TINA (Zenodo, sep 2026), que advierte verificarlos antes de citarlos como activos o válidos.",
  identifiersNoteEn:
    "Identifiers as declared in the TINA Master Document (Zenodo, Sep 2026), which warns to verify them before citing them as active or valid.",
}

/** Nombres de las 8 monedas phygital del Documento Magno. Solo nombres: el
 * hub no aporta descripciones verificables por moneda y no se inventan.
 * Advertencia de procedencia: el documento OSF menciona un "vector de 8
 * tokens funcionales" sin enumerarlos (OSF, §I.1); los 8 nombres listados
 * aquí provienen del Documento Magno del hub, no del corpus de Drive. */
export const phygitalCoins = ["XP", "Coin", "Crystal", "Prestige", "Honor", "Energy", "Influence", "Territorial Impact"]

export const legacyQuote = {
  text: "Toda mi vida e sido un miserable, asi que volverme millonario, seria incomodo al no saber que hacer con tanto dinero, asi que en lugar de buscar fama y fortuna, busco crear, un legado, crear un manual, una guia, un camino, para que quien venga detras mio con sus propios sueños, no tenga que pasar siendo invisible, ni sea ignorado como yo lo he sido por casi una decada, si morir en el olvido es el precio a pagar porque futuras generaciones puedan ser visibles que asi sea.",
  textEn:
    "All my life I have been miserable, so becoming a millionaire would be uncomfortable, not knowing what to do with so much money; so instead of seeking fame and fortune, I seek to create a legacy, to create a manual, a guide, a path, so that whoever comes after me with their own dreams does not have to go through being invisible, nor be ignored as I have been for almost a decade; if dying in oblivion is the price to pay so that future generations can be visible, so be it.",
  attribution: "Edwin Oswaldo Castillo Trejo · Fundador de TAMV Online Network",
  attributionEn: "Edwin Oswaldo Castillo Trejo · Founder of TAMV Online Network",
}

export const legacyGuide = [
  {
    step: "Paso 1",
    stepEn: "Step 1",
    title: "Nombra tu sueño y su territorio",
    titleEn: "Name your dream and its territory",
    subtitle: "Qué vas a construir, para quién y desde dónde.",
    subtitleEn: "What you will build, for whom, and from where.",
    text: "Todo camino TAMV empieza con origen declarado. Escribe tu proyecto en una frase que responda: qué construyes, a qué comunidad sirve y desde qué territorio nace. Si no fortalece a tu comunidad, según el criterio de autonomía del manifiesto, todavía no es un proyecto del Camino: es solo una idea.",
    textEn:
      "Every TAMV path begins with a declared origin. Write your project in one sentence that answers: what you build, which community it serves, and from which territory it is born. If it does not strengthen your community, under the manifesto's autonomy criterion, it is not yet a project of the Path: it is only an idea.",
    evidence: "Una ficha de propósito de un párrafo, firmada con tu nombre público.",
    evidenceEn: "A one-paragraph purpose record, signed with your public name.",
  },
  {
    step: "Paso 2",
    stepEn: "Step 2",
    title: "Crea tu identidad verificable",
    titleEn: "Create your verifiable identity",
    subtitle: "TRI, ORCID e ISNI: que tu nombre encuentre tu obra.",
    subtitleEn: "TRI, ORCID, and ISNI: so your name finds your work.",
    text: "La invisibilidad se rompe con identificadores persistentes, no con promesas. Abre tu ORCID gratuito, enlaza tus obras y solicita tu código TRI con el rol que realmente desempeñas. Firma todo, desde el primer día, con una afiliación normalizada.",
    textEn:
      "Invisibility is broken with persistent identifiers, not promises. Open your free ORCID, link your works, and request your TRI code with the role you actually perform. Sign everything, from day one, with a normalized affiliation.",
    evidence: "Tu línea de afiliación generada y validada.",
    evidenceEn: "Your generated and validated affiliation line.",
  },
  {
    step: "Paso 3",
    stepEn: "Step 3",
    title: "Documenta desde el día uno",
    titleEn: "Document from day one",
    subtitle: "Repositorio, docs/ y decisiones, no memoria oral.",
    subtitleEn: "Repository, docs/, and decisions — not oral memory.",
    text: "Adopta la estructura canónica de repositorios del ecosistema: propósito, alcance, dependencias, contratos, nivel de madurez, licencia, estado de despliegue, método de pruebas y responsable. Lo que no está documentado no existe para quien venga detrás de ti.",
    textEn:
      "Adopt the ecosystem's canonical repository structure: purpose, scope, dependencies, contracts, maturity level, license, deployment status, testing method, and owner. What is not documented does not exist for whoever comes after you.",
    evidence: "Un repositorio público enlazable, con su primer registro BookPI.",
    evidenceEn: "A linkable public repository, with its first BookPI record.",
  },
  {
    step: "Paso 4",
    stepEn: "Step 4",
    title: "Construye con estándar internacional",
    titleEn: "Build to an international standard",
    subtitle: "Calidad de adopción global, sin pedir permiso.",
    subtitleEn: "Global adoption quality, without asking permission.",
    text: "Construye como si tu artefacto fuera a adoptarse en cualquier país: contratos primero, versionado PATCH / MINOR / MAJOR con criterio, cambios reversibles y observables, y nada de parches ciegos. La calidad no se declara: se demuestra con pruebas, releases y documentación reproducible.",
    textEn:
      "Build as if your artifact were to be adopted in any country: contracts first, PATCH / MINOR / MAJOR versioning with judgment, reversible and observable changes, and no blind patches. Quality is not declared: it is demonstrated with tests, releases, and reproducible documentation.",
    evidence: "Una versión etiquetada (release) con pruebas y límites escritos.",
    evidenceEn: "A tagged release (version) with written tests and limits.",
  },
  {
    step: "Paso 5",
    stepEn: "Step 5",
    title: "Audítate con TQAF-10",
    titleEn: "Audit yourself with TQAF-10",
    subtitle: "Diez criterios antes de llamarlo terminado.",
    subtitleEn: "Ten criteria before calling it finished.",
    text: "Pasa tu output por el decálogo TQAF-10 con la honestidad del expediente TAMV: hoy marca 0/10 y su sello figura como no emitido, y aun así el trabajo se publica y se discute en abierto. Lo que no puedas evidenciar queda como pendiente, nunca como logro.",
    textEn:
      "Run your output through the TQAF-10 decalogue with the honesty of the TAMV record: today it scores 0/10 and its seal is listed as not issued, yet the work is published and discussed in the open. Whatever you cannot evidence stays pending, never a claimed achievement.",
    evidence: "Tu acta de autoauditoría TQAF.",
    evidenceEn: "Your TQAF self-audit record.",
  },
  {
    step: "Paso 6",
    stepEn: "Step 6",
    title: "Registra cada decisión en BookPI",
    titleEn: "Record every decision in BookPI",
    subtitle: "Decisión, cambio, código, evidencia, resultado.",
    subtitleEn: "Decision, change, code, evidence, result.",
    text: "BookPI es la memoria causal del Camino: cada decisión enlaza su problema, su disparador, la opción elegida, sus riesgos, sus pruebas y su reversión. Cuando algo falle —y fallará— la cadena causal te dirá por qué, sin culpas ni improvisación.",
    textEn:
      "BookPI is the causal memory of the Path: each decision links its problem, its trigger, the chosen option, its risks, its tests, and its rollback. When something fails — and it will — the causal chain will tell you why, without blame or improvisation.",
    evidence: "Tu archivo BPI-AAAA-XXXX.md generado.",
    evidenceEn: "Your generated BPI-YYYY-XXXX.md file.",
  },
  {
    step: "Paso 7",
    stepEn: "Step 7",
    title: "Publica en ciencia abierta",
    titleEn: "Publish in open science",
    subtitle: "DOI, licencia abierta y metadatos FAIR.",
    subtitleEn: "DOI, open license, and FAIR metadata.",
    text: "Deposita tu obra donde el mundo académico la pueda encontrar y citar: Zenodo, OSF o Figshare, con DOI persistente, licencia CC BY 4.0 y metadatos FAIR. Después enlázala desde tu ORCID. Un trabajo sin identificador persistente vuelve a ser invisible en cinco años.",
    textEn:
      "Deposit your work where the academic world can find and cite it: Zenodo, OSF, or Figshare, with a persistent DOI, a CC BY 4.0 license, and FAIR metadata. Then link it from your ORCID. A work without a persistent identifier becomes invisible again within five years.",
    evidence: "Un DOI resoluble que apunta a tu obra, citado en tu ORCID.",
    evidenceEn: "A resolvable DOI pointing to your work, cited in your ORCID.",
  },
  {
    step: "Paso 8",
    stepEn: "Step 8",
    title: "Hazte visible y deja el mapa",
    titleEn: "Become visible and leave the map",
    subtitle: "Foro, mapa y relevo: que nadie empiece de cero.",
    subtitleEn: "Forum, map, and handover: so nobody starts from zero.",
    text: "Cierra el círculo donde empezaste a ser visible: presenta tu trabajo en el foro académico, ubícalo en el mapa transformativo HCU y escribe lo que aprendiste para el siguiente. El legado no es tu obra terminada: es el camino que otro puede recorrer sin pedirte permiso ni pasar una década ignorado.",
    textEn:
      "Close the circle where you first became visible: present your work in the academic forum, place it on the HCU transformative map, and write down what you learned for the next person. The legacy is not your finished work: it is the path someone else can walk without asking your permission or spending a decade ignored.",
    evidence: "Tu hilo publicado y tu tema localizado en el mapa.",
    evidenceEn: "Your published thread and your topic located on the map.",
  },
]
