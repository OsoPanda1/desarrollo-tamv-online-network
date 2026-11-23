export const MEMBERSHIP_PLANS = {
  individual: {
    id: "individual",
    amountMxn: 229,
    currency: "mxn",
    interval: "month",
    name: "Membresía individual TAMV",
    description: "Participación guiada en proyectos, curso de perfil de desarrollo y preparación de proyectos para inversión.",
  },
  business: {
    id: "business",
    amountMxn: 699,
    currency: "mxn",
    interval: "month",
    name: "Membresía empresarial TAMV",
    description: "Participación empresarial, acompañamiento de presentación y herramientas de preparación de proyectos.",
  },
} as const

export type MembershipPlanId = keyof typeof MEMBERSHIP_PLANS

export function isMembershipPlanId(value: unknown): value is MembershipPlanId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(MEMBERSHIP_PLANS, value)
}

export function getMembershipPlan(value: unknown) {
  return isMembershipPlanId(value) ? MEMBERSHIP_PLANS[value] : null
}

export const LIVE_MEMBERSHIP_STATUSES = [
  "pending",
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "paused",
] as const

export const COURSE_SLUG = "perfil-y-pitch"
export const COURSE_MODULE_IDS = [
  "perfil-profesional",
  "portafolio-y-evidencia",
  "startup-y-validacion",
  "modelo-de-negocio",
  "pitch-para-inversion",
] as const

export type CourseModuleId = (typeof COURSE_MODULE_IDS)[number]

export function isCourseModuleId(value: unknown): value is CourseModuleId {
  return typeof value === "string" && (COURSE_MODULE_IDS as readonly string[]).includes(value)
}

export const MEMBERSHIP_TERMS_VERSION = "TAMV-MEMBERSHIP-TERMS-2026-11-23-v1" as const
