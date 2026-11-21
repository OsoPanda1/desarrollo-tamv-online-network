import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { researchIdentitySequences, researcherProfiles, user } from "@/lib/db/schema"
import { hasIsniFormat, isValidOrcid, normalizeIsni, normalizeOrcid } from "@/lib/identifiers"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { profileSchema } from "@/lib/validation"
import { sql, eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para consultar tu perfil.", 401)
  const [profile] = await db
    .select()
    .from(researcherProfiles)
    .where(eq(researcherProfiles.userId, session.user.id))
    .limit(1)
  return apiJson({ profile: profile ?? null })
}

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para actualizar tu perfil.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 12_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa el nombre, las líneas y los identificadores.", 400)

  const input = parsed.data
  const orcid = input.orcid ? normalizeOrcid(input.orcid) : null
  const isni = input.isni ? normalizeIsni(input.isni) : null
  if (orcid && !isValidOrcid(orcid)) return apiError("El ORCID no supera la comprobación de formato y dígito de control.", 400)
  if (isni && !hasIsniFormat(isni)) return apiError("El ISNI debe usar el formato XXXX-XXXX-XXXX-XXXX.", 400)

  const now = new Date()
  const lines = [...new Set(input.researchLines.map((line) => line.trim()).filter(Boolean))]
  const [profile] = await db.transaction(async (transaction) => {
    await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    const [existing] = await transaction
      .select({ id: researcherProfiles.id, tri: researcherProfiles.tri })
      .from(researcherProfiles)
      .where(eq(researcherProfiles.userId, session.user.id))
      .limit(1)

    let tri = existing?.tri ?? null
    if (!existing) {
      const year = now.getUTCFullYear()
      const [sequence] = await transaction
        .insert(researchIdentitySequences)
        .values({ year, nextNumber: 2 })
        .onConflictDoUpdate({
          target: researchIdentitySequences.year,
          set: { nextNumber: sql`${researchIdentitySequences.nextNumber} + 1` },
        })
        .returning({ allocated: sql<number>`${researchIdentitySequences.nextNumber} - 1` })
      tri = `TAMV-${year}-${String(sequence?.allocated ?? 1).padStart(6, "0")}`
    }

    if (existing) {
      return transaction
        .update(researcherProfiles)
        .set({ publicName: input.publicName, affiliation: input.affiliation || null, orcid, isni, researchLines: lines, isPublic: input.isPublic, updatedAt: now })
        .where(eq(researcherProfiles.userId, session.user.id))
        .returning()
    }

    return transaction
      .insert(researcherProfiles)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        publicName: input.publicName,
        tri,
        affiliation: input.affiliation || null,
        orcid,
        isni,
        researchLines: lines,
        isPublic: input.isPublic,
        verificationStatus: "declared",
        createdAt: now,
        updatedAt: now,
      })
      .returning()
  })

  return apiJson({ profile, note: "Los identificadores se guardan como declarados. La sintaxis del ORCID se valida localmente; no se consulta un registro externo." })
}
