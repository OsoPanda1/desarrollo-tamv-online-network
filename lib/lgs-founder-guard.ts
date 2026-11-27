import "server-only"

import { redirect } from "next/navigation"
import { getAppRole, getServerSession } from "@/lib/auth-helpers"
import { evaluateLgsAccessPolicy } from "@/lib/lgs/access-policy"

/**
 * Founder-only gate.
 * IMPORTANT: phishing-resistant MFA/step-up is not yet wired to the auth
 * provider. The hard-coded false below is an intentional release lock; do not
 * replace it with an environment flag. Access remains blocked until real
 * provider-backed session assurance and independent security review exist.
 */
export async function requireLgsFounder() {
  const session = await getServerSession()
  if (!session?.user) redirect("/sign-in?next=%2Fportal%2Flgs")

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

  if (!decision.allowed) redirect("/portal?access=restricted")
  return { userId: session.user.id, email: accountEmail, role } as const
}
