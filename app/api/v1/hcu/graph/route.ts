import { getPublicHcuGraph, PublicCollectionLimitError, PUBLIC_HCU_DOMAIN_LIMIT } from "@/lib/research/queries"
import { canonicalJson, sha3_512 } from "@/lib/research/provenance"
import { MAX_PUBLIC_HCU_ATOMS, MAX_PUBLIC_HCU_EDGES } from "@/lib/hcu/budget"
import { apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { domains, atoms, edges } = await getPublicHcuGraph()
    const snapshot = {
      domains: domains.map(({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder }) => ({ id, nameEs, nameEn, descriptionEs, descriptionEn, sortOrder })),
      atoms: atoms.map(({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined }) => ({ id, domainId, nameEs, nameEn, descriptionEs, descriptionEn, influenceX, riskY, evidenceZ, isProvisional, isQuarantined })),
      edges: edges.map(({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl }) => ({ id, sourceAtomIds, targetAtomIds, weight, sign, delayYears, tqafLevel, evidenceStatus, sourceTitle, sourceUrl })),
    }
    const digest = sha3_512(canonicalJson({
      domains: [...snapshot.domains].sort((left, right) => left.id.localeCompare(right.id)),
      atoms: [...snapshot.atoms].sort((left, right) => left.id.localeCompare(right.id)),
      edges: [...snapshot.edges].sort((left, right) => left.id.localeCompare(right.id)),
    }))
    return apiJson({
      version: "1.0",
      modelVersion: "tamv-hcu-exploratory-v2",
      ...snapshot,
      limits: { domains: PUBLIC_HCU_DOMAIN_LIMIT, atoms: MAX_PUBLIC_HCU_ATOMS, edges: MAX_PUBLIC_HCU_EDGES },
      integrity: { algorithm: "SHA3-512", digest, scope: "public graph snapshot", externalAnchor: false },
      caveat: "El grafo organiza hipótesis y parámetros documentados; no es un mapa causal validado ni una medición de impacto. La huella no es una firma ni un anclaje externo.",
    })
  } catch (error) {
    if (error instanceof PublicCollectionLimitError) {
      return apiJson({ error: "El mapa HCU supera el límite operativo; no se devuelve un grafo truncado.", code: "hcu_public_limit_exceeded" }, 503)
    }
    return apiJson({ error: "El mapa HCU no está disponible." }, 503)
  }
}
