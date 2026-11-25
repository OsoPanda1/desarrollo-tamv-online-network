/**
 * Twenty achievements, each tied to a fact the application can actually
 * observe. No badge is awarded for browsing, for a model answer, or for an
 * unverifiable claim: every rule is a count over stored records.
 */

export type AchievementTier = "bronce" | "plata" | "oro" | "obsidiana"

export type AchievementFacts = {
  account: boolean
  proposals: number
  accepted: number
  published: number
  evidence: number
  reviews: number
  hcuAtoms: number
  hcuHyperedges: number
  hcuRuns: number
  interests: number
  hasOrcid: boolean
  hasIsni: boolean
  hasPersistentId: boolean
  publicProfile: boolean
  membershipActive: boolean
  courseModules: number
  consentGranted: boolean
}

export type AchievementMetric = keyof AchievementFacts

export type AchievementSpec = {
  id: string
  badge: string
  code: string
  tier: AchievementTier
  xp: number
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  criterionEs: string
  criterionEn: string
  metric: AchievementMetric
  target: number
}

export const EMPTY_FACTS: AchievementFacts = {
  account: false,
  proposals: 0,
  accepted: 0,
  published: 0,
  evidence: 0,
  reviews: 0,
  hcuAtoms: 0,
  hcuHyperedges: 0,
  hcuRuns: 0,
  interests: 0,
  hasOrcid: false,
  hasIsni: false,
  hasPersistentId: false,
  publicProfile: false,
  membershipActive: false,
  courseModules: 0,
  consentGranted: false,
}

export const COURSE_MODULE_TOTAL = 5

export const achievements: AchievementSpec[] = [
  {
    id: "semilla",
    badge: "semilla",
    code: "SEM",
    tier: "bronce",
    xp: 10,
    nameEs: "Primera semilla",
    nameEn: "First seed",
    descriptionEs: "Una cuenta verificada abre el registro de tu recorrido.",
    descriptionEn: "A verified account opens the record of your journey.",
    criterionEs: "Crear una cuenta e iniciar sesión.",
    criterionEn: "Create an account and sign in.",
    metric: "account",
    target: 1,
  },
  {
    id: "voz",
    badge: "voz",
    code: "VOZ",
    tier: "bronce",
    xp: 10,
    nameEs: "Voz inicial",
    nameEn: "First voice",
    descriptionEs: "Tu primera propuesta entra al flujo editorial.",
    descriptionEn: "Your first proposal enters the editorial flow.",
    criterionEs: "Registrar 1 propuesta de investigación.",
    criterionEn: "Submit 1 research proposal.",
    metric: "proposals",
    target: 1,
  },
  {
    id: "tejedor",
    badge: "tejedor",
    code: "TEJ",
    tier: "plata",
    xp: 20,
    nameEs: "Tejedor",
    nameEn: "Weaver",
    descriptionEs: "Cinco propuestas sostienen una línea de trabajo reconocible.",
    descriptionEn: "Five proposals sustain a recognisable line of work.",
    criterionEs: "Registrar 5 propuestas.",
    criterionEn: "Submit 5 proposals.",
    metric: "proposals",
    target: 5,
  },
  {
    id: "archivo",
    badge: "archivo",
    code: "ARC",
    tier: "bronce",
    xp: 10,
    nameEs: "Archivo vivo",
    nameEn: "Living archive",
    descriptionEs: "La primera evidencia convierte una idea en expediente.",
    descriptionEn: "The first piece of evidence turns an idea into a case file.",
    criterionEs: "Adjuntar 1 evidencia.",
    criterionEn: "Attach 1 evidence record.",
    metric: "evidence",
    target: 1,
  },
  {
    id: "trazador",
    badge: "trazador",
    code: "TRZ",
    tier: "plata",
    xp: 20,
    nameEs: "Trazador",
    nameEn: "Tracer",
    descriptionEs: "Tres evidencias versionadas permiten reconstruir el argumento.",
    descriptionEn: "Three versioned evidence records make the argument reconstructable.",
    criterionEs: "Adjuntar 3 evidencias.",
    criterionEn: "Attach 3 evidence records.",
    metric: "evidence",
    target: 3,
  },
  {
    id: "cartografo",
    badge: "cartografo",
    code: "CAR",
    tier: "plata",
    xp: 20,
    nameEs: "Cartógrafo",
    nameEn: "Cartographer",
    descriptionEs: "El primer átomo del mapa HCU abre tu topología.",
    descriptionEn: "The first HCU atom opens your topology.",
    criterionEs: "Crear 1 átomo HCU.",
    criterionEn: "Create 1 HCU atom.",
    metric: "hcuAtoms",
    target: 1,
  },
  {
    id: "faro",
    badge: "faro",
    code: "FAR",
    tier: "oro",
    xp: 30,
    nameEs: "Faro",
    nameEn: "Lighthouse",
    descriptionEs: "Diez átomos con evidencia forman una señal estable.",
    descriptionEn: "Ten atoms with evidence form a stable signal.",
    criterionEs: "Crear 10 átomos HCU.",
    criterionEn: "Create 10 HCU atoms.",
    metric: "hcuAtoms",
    target: 10,
  },
  {
    id: "simulador",
    badge: "simulador",
    code: "SIM",
    tier: "plata",
    xp: 20,
    nameEs: "Simulador",
    nameEn: "Simulator",
    descriptionEs: "Una ejecución determinista con semilla registrada.",
    descriptionEn: "One deterministic run with a recorded seed.",
    criterionEs: "Ejecutar 1 simulación HCU.",
    criterionEn: "Run 1 HCU simulation.",
    metric: "hcuRuns",
    target: 1,
  },
  {
    id: "constelacion",
    badge: "constelacion",
    code: "CST",
    tier: "oro",
    xp: 30,
    nameEs: "Constelación",
    nameEn: "Constellation",
    descriptionEs: "Cinco simulaciones comparables cuentan una trayectoria.",
    descriptionEn: "Five comparable simulations tell a trajectory.",
    criterionEs: "Ejecutar 5 simulaciones HCU.",
    criterionEn: "Run 5 HCU simulations.",
    metric: "hcuRuns",
    target: 5,
  },
  {
    id: "nodo",
    badge: "nodo",
    code: "NOD",
    tier: "bronce",
    xp: 10,
    nameEs: "Nodo",
    nameEn: "Node",
    descriptionEs: "Tu primer interés de colaboración te conecta al tejido.",
    descriptionEn: "Your first collaboration interest connects you to the fabric.",
    criterionEs: "Registrar 1 interés de colaboración.",
    criterionEn: "Register 1 collaboration interest.",
    metric: "interests",
    target: 1,
  },
  {
    id: "identidad",
    badge: "identidad",
    code: "IDN",
    tier: "plata",
    xp: 20,
    nameEs: "Identidad verificable",
    nameEn: "Verifiable identity",
    descriptionEs: "Un identificador persistente con formato validado.",
    descriptionEn: "A persistent identifier with validated format.",
    criterionEs: "Registrar un ORCID o ISNI válido.",
    criterionEn: "Record a valid ORCID or ISNI.",
    metric: "hasPersistentId",
    target: 1,
  },
  {
    id: "perfil",
    badge: "perfil",
    code: "PRF",
    tier: "bronce",
    xp: 10,
    nameEs: "Perfil público",
    nameEn: "Public profile",
    descriptionEs: "Publicar tu perfil con consentimiento explícito.",
    descriptionEn: "Publish your profile with explicit consent.",
    criterionEs: "Activar el perfil público de investigador.",
    criterionEn: "Enable the public researcher profile.",
    metric: "publicProfile",
    target: 1,
  },
  {
    id: "revisor",
    badge: "revisor",
    code: "REV",
    tier: "oro",
    xp: 30,
    nameEs: "Revisor",
    nameEn: "Reviewer",
    descriptionEs: "Una revisión registrada y fechada, nunca una respuesta automática.",
    descriptionEn: "One recorded, dated review, never an automatic answer.",
    criterionEs: "Emitir 1 revisión como moderador o revisor.",
    criterionEn: "Issue 1 review as moderator or reviewer.",
    metric: "reviews",
    target: 1,
  },
  {
    id: "curador",
    badge: "curador",
    code: "CUR",
    tier: "oro",
    xp: 30,
    nameEs: "Curador",
    nameEn: "Curator",
    descriptionEs: "Una propuesta aceptada supera el filtro editorial.",
    descriptionEn: "One accepted proposal passes the editorial filter.",
    criterionEs: "Obtener 1 propuesta aceptada.",
    criterionEn: "Have 1 proposal accepted.",
    metric: "accepted",
    target: 1,
  },
  {
    id: "publicador",
    badge: "publicador",
    code: "PUB",
    tier: "oro",
    xp: 30,
    nameEs: "Publicador",
    nameEn: "Publisher",
    descriptionEs: "Una propuesta publicada con estado y exportación.",
    descriptionEn: "One published proposal with state and export.",
    criterionEs: "Publicar 1 propuesta.",
    criterionEn: "Publish 1 proposal.",
    metric: "published",
    target: 1,
  },
  {
    id: "legado",
    badge: "legado",
    code: "LEG",
    tier: "obsidiana",
    xp: 50,
    nameEs: "Legado",
    nameEn: "Legacy",
    descriptionEs: "Tres publicaciones sostienen una contribución duradera.",
    descriptionEn: "Three publications sustain a lasting contribution.",
    criterionEs: "Publicar 3 propuestas.",
    criterionEn: "Publish 3 proposals.",
    metric: "published",
    target: 3,
  },
  {
    id: "membresia",
    badge: "membresia",
    code: "MEM",
    tier: "plata",
    xp: 20,
    nameEs: "Membresía activa",
    nameEn: "Active membership",
    descriptionEs: "Una suscripción activa o en prueba, validada en servidor.",
    descriptionEn: "An active or trialing subscription, validated server-side.",
    criterionEs: "Mantener una membresía activa o en prueba.",
    criterionEn: "Hold an active or trialing membership.",
    metric: "membershipActive",
    target: 1,
  },
  {
    id: "aprendiz",
    badge: "aprendiz",
    code: "APR",
    tier: "bronce",
    xp: 10,
    nameEs: "Aprendiz",
    nameEn: "Learner",
    descriptionEs: "El primer módulo completado abre la ruta.",
    descriptionEn: "The first completed module opens the path.",
    criterionEs: "Completar 1 módulo del curso.",
    criterionEn: "Complete 1 course module.",
    metric: "courseModules",
    target: 1,
  },
  {
    id: "graduado",
    badge: "graduado",
    code: "GRA",
    tier: "oro",
    xp: 30,
    nameEs: "Graduado",
    nameEn: "Graduate",
    descriptionEs: "Los cinco módulos completados; sin acreditación oficial implícita.",
    descriptionEn: "All five modules completed; no implied official accreditation.",
    criterionEs: "Completar los 5 módulos del curso.",
    criterionEn: "Complete all 5 course modules.",
    metric: "courseModules",
    target: COURSE_MODULE_TOTAL,
  },
  {
    id: "custodio",
    badge: "custodio",
    code: "CUS",
    tier: "plata",
    xp: 20,
    nameEs: "Custodio",
    nameEn: "Custodian",
    descriptionEs: "Consentimiento de compartición otorgado y revocable.",
    descriptionEn: "Share consent granted and revocable.",
    criterionEs: "Otorgar consentimiento de compartición.",
    criterionEn: "Grant share consent.",
    metric: "consentGranted",
    target: 1,
  },
]

export const ACHIEVEMENT_TOTAL = achievements.length

export type AchievementState = AchievementSpec & {
  earned: boolean
  current: number
  progress: number
}

function metricValue(facts: AchievementFacts, metric: AchievementMetric): number {
  const value = facts[metric]
  if (typeof value === "boolean") return value ? 1 : 0
  return Number.isFinite(value) ? (value as number) : 0
}

export function evaluateAchievements(facts: AchievementFacts): AchievementState[] {
  return achievements.map((achievement) => {
    const current = metricValue(facts, achievement.metric)
    const progress = achievement.target <= 0 ? 1 : Math.min(1, current / achievement.target)
    return {
      ...achievement,
      earned: current >= achievement.target,
      current: Math.min(current, achievement.target),
      progress,
    }
  })
}

export function earnedExperience(states: AchievementState[]): number {
  return states.reduce((total, state) => total + (state.earned ? state.xp : 0), 0)
}

export const levels = [
  { min: 0, nameEs: "Semilla", nameEn: "Seed" },
  { min: 60, nameEs: "Aprendiz", nameEn: "Apprentice" },
  { min: 150, nameEs: "Tejedor", nameEn: "Weaver" },
  { min: 280, nameEs: "Cartógrafo", nameEn: "Cartographer" },
  { min: 450, nameEs: "Custodio", nameEn: "Custodian" },
]

export function levelFor(experience: number) {
  let current = levels[0]
  let next: (typeof levels)[number] | null = null
  for (const level of levels) {
    if (experience >= level.min) current = level
    else if (!next) next = level
  }
  const span = next ? next.min - current.min : 1
  const progress = next ? Math.min(1, (experience - current.min) / span) : 1
  return { current, next, progress }
}
