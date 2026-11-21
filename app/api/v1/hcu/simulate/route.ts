import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hcuRuns, user } from "@/lib/db/schema"
import { simulateHcu, HCU_MODEL_VERSION, type HcuAtom, type HcuEdge } from "@/lib/hcu/model"
import { estimateHcuSimulationWork, isHcuGraphWithinLimits, MAX_HCU_SIMULATION_WORK } from "@/lib/hcu/budget"
import { apiError, apiJson, isSameOriginRequest, readJsonBody, RequestBodyError } from "@/lib/http"
import { sha256, canonicalJson } from "@/lib/research/provenance"
import { getPublicHcuGraph } from "@/lib/research/queries"
import { simulationSchema } from "@/lib/validation"
import { and, count, eq, gte } from "drizzle-orm"

export const dynamic = "force-dynamic"

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

  // Reject expensive work before simulation; the final transactional quota
  // check below remains authoritative for concurrent requests.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [priorRuns] = await db
    .select({ value: count() })
    .from(hcuRuns)
    .where(and(eq(hcuRuns.userId, session.user.id), gte(hcuRuns.createdAt, since)))
  if ((priorRuns?.value ?? 0) >= 20) {
    return apiError("Alcanzaste el límite de 20 simulaciones por día.", 429)
  }

  const graph = await getPublicHcuGraph()
  if (!isHcuGraphWithinLimits(graph.atoms.length, graph.edges.length)) {
    return apiError("El grafo excede el presupuesto operativo de simulación. Reduce su complejidad.", 503)
  }
  const estimatedWork = estimateHcuSimulationWork({
    mcRuns: input.mcRuns,
    startYear: input.startYear,
    endYear: input.endYear,
    atomCount: graph.atoms.length,
    edgeCount: graph.edges.length,
  })
  if (estimatedWork > MAX_HCU_SIMULATION_WORK) {
    return apiError("La combinación de horizonte, muestras y grafo excede el presupuesto de cálculo. Reduce las muestras o el horizonte.", 400)
  }
  const knownAtomIds = new Set(graph.atoms.map((atom) => atom.id))
  if (input.shocks.some((shock) => !knownAtomIds.has(shock.atomId)) || input.quarantine.some((id) => !knownAtomIds.has(id))) {
    return apiError("El grafo cambió o incluye un nodo no disponible. Recarga la página.", 400)
  }

  const atoms: HcuAtom[] = graph.atoms.map((atom) => ({ id: atom.id, influenceX: atom.influenceX, riskY: atom.riskY, evidenceZ: atom.evidenceZ, isQuarantined: atom.isQuarantined }))
  const edges: HcuEdge[] = graph.edges.map((edge) => ({ id: edge.id, sourceAtomIds: edge.sourceAtomIds, targetAtomIds: edge.targetAtomIds, weight: edge.weight, sign: edge.sign, delayYears: edge.delayYears, evidenceStatus: edge.evidenceStatus }))
  const output = simulateHcu(atoms, edges, input)
  const outputHash = sha256(canonicalJson(output))
  const id = crypto.randomUUID()

  const result = await db.transaction(async (transaction) => {
    const [account] = await transaction.select({ id: user.id }).from(user).where(eq(user.id, session.user.id)).for("update")
    if (!account) return { error: "account_missing" as const }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [dailyRuns] = await transaction
      .select({ value: count() })
      .from(hcuRuns)
      .where(and(eq(hcuRuns.userId, session.user.id), gte(hcuRuns.createdAt, since)))
    if ((dailyRuns?.value ?? 0) >= 20) return { error: "rate_limit" as const }

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
    return { id }
  })

  if ("error" in result) {
    if (result.error === "rate_limit") return apiError("Alcanzaste el límite de 20 simulaciones por día.", 429)
    return apiError("No fue posible validar la cuenta de investigación.", 401)
  }
  return apiJson({ id: result.id, modelVersion: HCU_MODEL_VERSION, inputHash: output.inputHash, outputHash, output }, 201)
}
