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
