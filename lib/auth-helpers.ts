import "server-only"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export type AppRole = "member" | "reviewer" | "editor" | "admin"

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getRequestSession(requestHeaders: Headers) {
  return auth.api.getSession({ headers: requestHeaders })
}

export async function getAppRole(userId: string): Promise<AppRole> {
  const [record] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return (record?.role as AppRole | undefined) ?? "member"
}

export async function requireUser(nextPath = "/portal") {
  const session = await getServerSession()
  if (!session?.user) redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`)
  return session.user
}

export async function requireModeratorPage() {
  const user = await requireUser("/portal/moderacion")
  const role = await getAppRole(user.id)
  if (!["admin", "editor", "reviewer"].includes(role)) redirect("/portal")
  return { user, role }
}

export async function requireModeratorRequest(requestHeaders: Headers) {
  const session = await getRequestSession(requestHeaders)
  if (!session?.user) return null
  const role = await getAppRole(session.user.id)
  if (!["admin", "editor", "reviewer"].includes(role)) return null
  return { user: session.user, role }
}
