import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hcuRunReservations, hcuRuns, user } from "@/lib/db/schema"
import { simulateHcu, HCU_MODEL_VERSION, type HcuAtom, type HcuEdge } from "@/lib/hcu/model"
import { estimateHcuSimulationWork, isHcuGraphWithinLimits, MAX_HCU_SIMULATION_WORK } from "@/lib/hcu/budget"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { sha256, sha3_512, canonicalJson } from "@/lib/research/provenance"
import { getUserHcuGraph } from "@/lib/research/queries"
import { simulationSchema } from "@/lib/validation"
import { and, count, eq, gt, gte, lte } from "drizzle-orm"

export const dynamic = "force-dynamic"

const HCU_DAILY_LIMIT = 20
const HCU_USAGE_WINDOW_MS = 24 * 60 * 60 * 1000
const HCU_RESERVATION_TTL_MS = 5 * 60 * 1000

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("Origen no autorizado.", 403)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para ejecutar y guardar una simulación.", 401)

  let body: unknown
  try {
    body = await readJsonBody(request, 12_000)
  } catch (error) {
    return apiError(error instanceof RequestBodyError ? error.message : "Solicitud no válida.", 400)
  }
  const parsed = simulationSchema.safeParse(body)
  if (!parsed.success) return apiError("Revisa los años, choques y límites del modelo.", 400)
  const input = parsed.data
  if (input.endYear < input.startYear || input.endYear - input.startYear > 24) {
    return apiError("El horizonte debe ser ascendente y no superar 24 años.", 400)
  }
  if (input.shocks.some((shock) => shock.year < input.startYear || shock.year > input.endYear)) {
    return apiError("Cada choque debe caer dentro del horizonte elegido.", 400)
  }

  let reservationId: string | undefined
  try {
    const earlyNow = Date.now()
    const earlySince = new Date(earlyNow - HCU_USAGE_WINDOW_MS)
    const [priorRuns] = await db
      .select({ value: count() })
      .from(hcuRuns)
      .where(and(eq(hcuRuns.userId, session.user.id), gte(hcuRuns.createdAt, earlySince)))
    const [priorReservations] = await db
      .select({ value: count() })
      .from(hcuRunReservations)
      .where(and(
        eq(hcuRunReservations.userId, session.user.id),
        gte(hcuRunReservations.createdAt, earlySince),
        gt(hcuRunReservations.expiresAt, new Date(earlyNow)),
      ))
    if ((priorRuns?.value ?? 0) + (priorReservations?.value ?? 0) >= HCU_DAILY_LIMIT) {
      return apiError("Alcanzaste el límite de 20 simulaciones por día.", 429)
    }

    const graph = await getUserHcuGraph(session.user.id)
    if (!isHcuGraphWithinLimits(graph.atoms.length, graph.edges.length)) {
      return apiError("El grafo excede el presupuesto operativo de simulación. Reduce su complejidad.", 503)
    }
    const edgeFanout = graph.edges.length
      ? graph.edges.reduce((sum, edge) => sum + edge.sourceAtomIds.length + edge.targetAtomIds.length, 0) / graph.edges.length
      : 1
    const estimatedWork = estimateHcuSimulationWork({
      mcRuns: input.mcRuns,
      startYear: input.startYear,
      endYear: input.endYear,
      atomCount: graph.atoms.length,
      edgeCount: graph.edges.length,
      edgeFanout,
    })
    if (estimatedWork > MAX_HCU_SIMULATION_WORK) {
      return apiError("La combinación de horizonte, muestras y grafo excede el presupuesto de cálculo. Reduce las muestras o el horizonte.", 400)
    }
    const knownAtomIds = new Set(graph.atoms.map((atom) => atom.id))
    if (input.shocks.some((shock) => !knownAtomIds.has(shock.atomId)) || input.quarantine.some((id) => !knownAtomIds.has(id))) {
      return apiError("El grafo cambió o incluye un nodo no disponible. Recarga la página.", 400)
    }

    const reservation = await db.transaction(async (transaction) => {
      const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
      if (!account) return { error: "account_missing" as const }
      const now = Date.now()
      const since = new Date(now - HCU_USAGE_WINDOW_MS)
      const cutoff = new Date(now)
      await transaction
        .delete(hcuRunReservations)
        .where(and(eq(hcuRunReservations.userId, session.user.id), lte(hcuRunReservations.expiresAt, cutoff)))
      const [dailyRuns] = await transaction
        .select({ value: count() })
        .from(hcuRuns)
        .where(and(eq(hcuRuns.userId, session.user.id), gte(hcuRuns.createdAt, since)))
      const [activeReservations] = await transaction
        .select({ value: count() })
        .from(hcuRunReservations)
        .where(and(
          eq(hcuRunReservations.userId, session.user.id),
          gte(hcuRunReservations.createdAt, since),
          gt(hcuRunReservations.expiresAt, cutoff),
        ))
      if ((dailyRuns?.value ?? 0) + (activeReservations?.value ?? 0) >= HCU_DAILY_LIMIT) {
        return { error: "rate_limit" as const }
      }
      const id = crypto.randomUUID()
      await transaction.insert(hcuRunReservations).values({
        id,
        userId: session.user.id,
        expiresAt: new Date(now + HCU_RESERVATION_TTL_MS),
      })
      return { id }
    })

    if ("error" in reservation) {
      if (reservation.error === "rate_limit") return apiError("Alcanzaste el límite de 20 simulaciones por día.", 429)
      return apiError("No fue posible validar la cuenta de investigación.", 401)
    }
    const reservedId = reservation.id
    reservationId = reservedId

    const atoms: HcuAtom[] = graph.atoms.map((atom) => ({ id: atom.id, domainId: atom.domainId, influenceX: atom.influenceX, riskY: atom.riskY, evidenceZ: atom.evidenceZ, isQuarantined: atom.isQuarantined }))
    const edges: HcuEdge[] = graph.edges.map((edge) => ({ id: edge.id, sourceAtomIds: edge.sourceAtomIds, targetAtomIds: edge.targetAtomIds, weight: edge.weight, sign: edge.sign, delayYears: edge.delayYears, evidenceStatus: edge.evidenceStatus }))
    const sourceGraphHash = sha3_512(canonicalJson({
      atoms: graph.atoms.map(({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, tri, roleCode, isProvisional, isQuarantined }) => ({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, tri, roleCode, isProvisional, isQuarantined })).sort((left, right) => left.id.localeCompare(right.id)),
      edges: graph.edges.map(({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl }) => ({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl })).sort((left, right) => left.id.localeCompare(right.id)),
    }))
    const output = simulateHcu(atoms, edges, input, sourceGraphHash)
    const outputHash = sha256(canonicalJson(output))
    const id = crypto.randomUUID()

    const persisted = await db.transaction(async (transaction) => {
      const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
      if (!account) return { error: "account_missing" as const }
      await transaction.insert(hcuRuns).values({
        id,
        userId: session.user.id,
        scenario: input.scenario,
        seed: input.seed,
        startYear: input.startYear,
        endYear: input.endYear,
        inputHash: output.inputHash,
        outputHash,
        modelVersion: HCU_MODEL_VERSION,
        output,
      })
      await transaction
        .delete(hcuRunReservations)
        .where(and(eq(hcuRunReservations.id, reservedId), eq(hcuRunReservations.userId, session.user.id)))
      return { id }
    })

    if ("error" in persisted) return apiError("No fue posible validar la cuenta de investigación.", 401)
    reservationId = undefined
    return apiJson({ id: persisted.id, modelVersion: HCU_MODEL_VERSION, inputHash: output.inputHash, outputHash, output }, 201)
  } catch {
    return apiError("No fue posible ejecutar y guardar la simulación.", 500)
  } finally {
    if (reservationId) {
      try {
        await db
          .delete(hcuRunReservations)
          .where(and(eq(hcuRunReservations.id, reservationId), eq(hcuRunReservations.userId, session.user.id)))
      } catch {
        // Expiry bounds a reservation if cleanup fails.
      }
    }
  }
}
