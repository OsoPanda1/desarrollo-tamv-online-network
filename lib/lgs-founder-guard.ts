import "server-only"

import { redirect } from "next/navigation"
import { getAppRole, getServerSession } from "@/lib/auth-helpers"

/**
 * Founder-only gate. Email is an identity attribute, never a credential.
 * Production must add phishing-resistant MFA/step-up before enabling the flag.
 */
export async function requireLgsFounder() {
  const session = await getServerSession()
  if (!session?.user) redirect("/sign-in?next=%2Fportal%2Flgs")

  const founderEmail = (process.env.LGS_FOUNDER_EMAIL ?? "tamvonlinenetwork@outlook.es").trim().toLowerCase()
  const accountEmail = session.user.email.trim().toLowerCase()
  const verifiedFounder = accountEmail === founderEmail && session.user.emailVerified === true
  const role = await getAppRole(session.user.id)
  const featureEnabled = process.env.LGS_FOUNDER_ACCESS_ENABLED === "true"

  if (!featureEnabled || !verifiedFounder || role !== "admin") redirect("/portal?access=restricted")

  return { userId: session.user.id, email: accountEmail, role } as const
}
