import "server-only"

import { redirect } from "next/navigation"
import { getAppRole, getServerSession } from "@/lib/auth-helpers"
import { evaluateLgsAccessPolicy } from "@/lib/lgs/access-policy"

export type LgsFounderAccess =
  | { allowed: true; founder: { userId: string; email: string; role: "admin" } }
  | { allowed: false; authenticated: boolean; reason: string }

/**
 * Founder-only access evaluator. MFA is deliberately hard-locked to false
 * until provider-backed phishing-resistant step-up is implemented and tested.
 */
export async function getLgsFounderAccess(): Promise<LgsFounderAccess> {
  const session = await getServerSession()
  if (!session?.user) return { allowed: false, authenticated: false, reason: "unauthenticated" }

  const founderEmail = (process.env.LGS_FOUNDER_EMAIL ?? "tamvonlinenetwork@outlook.es").trim().toLowerCase()
  const accountEmail = session.user.email.trim().toLowerCase()
  const verifiedFounder = accountEmail === founderEmail && session.user.emailVerified === true
  const role = await getAppRole(session.user.id)
  const decision = evaluateLgsAccessPolicy({
    sessionAuthenticated: true,
    founderEmailVerified: verifiedFounder,
    databaseRoleIsAdmin: role === "admin",
    featureFlagEnabled: process.env.LGS_FOUNDER_ACCESS_ENABLED === "true",
    phishingResistantMfaSatisfied: false,
    independentSecurityReviewApproved: process.env.LGS_FOUNDER_SECURITY_REVIEW_APPROVED === "true",
  })

  if (!decision.allowed) {
    return { allowed: false, authenticated: true, reason: decision.failedRequirements[0] ?? "access-restricted" }
  }
  return { allowed: true, founder: { userId: session.user.id, email: accountEmail, role: "admin" } }
}

export async function requireLgsFounder() {
  const result = await getLgsFounderAccess()
  if (!result.allowed) {
    if (!result.authenticated) redirect("/sign-in?next=%2Fportal%2Flgs")
    redirect("/portal?access=restricted")
  }
  return result.founder
}
