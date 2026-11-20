export type ProjectCategory = "Arquitectura" | "IA" | "Academia" | "Territorio"

export type ProjectFilter = "Todos" | ProjectCategory

export const projectFilters: ProjectFilter[] = [
  "Todos",
  "Arquitectura",
  "IA",
  "Academia",
  "Territorio",
]

export const ecosystemProjects = [
  {
    id: "md-x4",
    category: "Arquitectura" as const,
    title: "TAMV MD-X4",
    subtitle: "Arquitectura digital heptafederada",
    description:
      "Un marco para relacionar identidad, conocimiento, gobernanza, inteligencia artificial y territorio dentro de una visión interoperable.",
    status: "Marco documentado",
    limit:
      "La documentación describe una arquitectura de referencia. Esta presentación no afirma un kernel desplegado, una red federada operativa ni una auditoría técnica independiente.",
  },
  {
    id: "isabella",
    category: "IA" as const,
    title: "Isabella Villaseñor AI",
    subtitle: "Inteligencia artificial con límites explícitos",
    description:
      "Una propuesta de asistencia y orquestación que sitúa la supervisión humana, la trazabilidad y los mandatos acotados en el centro.",
    status: "Diseño y documentación",
    limit:
      "Las capacidades descritas en los materiales son objetivos y especificaciones del proyecto. No se presenta aquí una certificación, una auditoría de seguridad o un servicio productivo verificado.",
  },
  {
    id: "bookpi",
    category: "Arquitectura" as const,
    title: "BookPI",
    subtitle: "Procedencia y registro de decisiones",
    description:
      "Un concepto de bitácora de integridad para relacionar eventos, versiones y evidencia, con énfasis en privacidad y responsabilidad.",
    status: "Propuesta técnica",
    limit:
      "Las afirmaciones de inmutabilidad o integridad requieren implementación reproducible y revisión externa. La descripción no equivale a una garantía criptográfica.",
  },
  {
    id: "utamv",
    category: "Academia" as const,
    title: "UTAMV Campus Online",
    subtitle: "Una visión de aprendizaje abierto",
    description:
      "Un modelo académico que busca integrar recursos digitales, pensamiento crítico y formación centrada en las personas.",
    status: "Iniciativa en desarrollo",
    limit:
      "No se afirma reconocimiento oficial, RVOE, acreditación, equivalencia de estudios ni emisión de títulos oficiales. La validez académica depende de las autorizaciones aplicables.",
  },
  {
    id: "rdm-hub",
    category: "Territorio" as const,
    title: "RDM Digital Hub",
    subtitle: "Tecnología con contexto territorial",
    description:
      "Una propuesta para conectar capacidades digitales, patrimonio y memoria comunitaria desde Real del Monte, Hidalgo.",
    status: "Visión territorial documentada",
    limit:
      "La referencia al Nodo Cero expresa el origen y la visión del proyecto. No implica una infraestructura territorial desplegada o un servicio público activo.",
  },
]

export const researchInventory = {
  platforms: 100,
  capabilities: 500,
  categories: 10,
}

export const governancePrinciples = [
  {
    number: "01",
    title: "Procedencia",
    text: "Identificar fuente, autoría, versión, fecha y licencia de cada artefacto.",
  },
  {
    number: "02",
    title: "Método reproducible",
    text: "Describir pruebas, condiciones de ejecución, límites y resultados observables.",
  },
  {
    number: "03",
    title: "Revisión humana",
    text: "Mantener responsables identificables, revisión independiente y vías de corrección.",
  },
  {
    number: "04",
    title: "Afirmaciones proporcionales",
    text: "Distinguir con claridad propuesta, prototipo, operación y validación externa.",
  },
]

export const roadmapSteps = [
  {
    phase: "01",
    title: "Hacer verificable la base",
    text: "Ordenar fuentes, versiones, licencias e identificadores y documentar qué está disponible hoy.",
  },
  {
    phase: "02",
    title: "Probar un caso acotado",
    text: "Definir un piloto medible y someter arquitectura, seguridad y resultados a revisión técnica independiente.",
  },
  {
    phase: "03",
    title: "Abrir colaboración y gobernanza",
    text: "Establecer reglas transparentes de participación, revisión, apelación y representación comunitaria.",
  },
  {
    phase: "04",
    title: "Escalar con evidencia",
    text: "Ampliar interoperabilidad y alianzas solo cuando capacidad, sostenibilidad e impacto puedan demostrarse.",
  },
]
