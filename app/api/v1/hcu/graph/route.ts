import { getPublicHcuGraph } from "@/lib/research/queries"
import { apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { domains, atoms, edges } = await getPublicHcuGraph()
    return apiJson({
      version: "1.0",
      modelVersion: "tamv-hcu-exploratory-v1",
      domains: domains.map(({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder }) => ({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder })),
      atoms: atoms.map(({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined }) => ({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined })),
      edges: edges.map(({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl }) => ({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl })),
      caveat: "El grafo organiza hipótesis y parámetros documentados; no es un mapa causal validado ni una medición de impacto.",
    })
  } catch {
    return apiJson({ error: "El mapa HCU no está disponible." }, 503)
  }
}
