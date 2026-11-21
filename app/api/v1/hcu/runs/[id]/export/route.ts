import { auth } from "@/lib/auth"
import { apiError } from "@/lib/http"
import { getUserHcuRun } from "@/lib/research/queries"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para exportar esta ejecución.", 401)
  const { id } = await context.params
  const run = await getUserHcuRun(session.user.id, id)
  if (!run) return apiError("No se encontró la ejecución.", 404)

  const exportRecord = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `HCU ${run.scenario} simulation ${run.id}`,
    dateCreated: run.createdAt.toISOString(),
    version: run.modelVersion,
    identifier: run.id,
    variableMeasured: ["Índice HCU simulado (0–100)", "Riesgo medio declarado", "Evidencia media declarada"],
    measurementTechnique: "Simulación exploratoria determinista con muestreo Monte Carlo y semilla registrada.",
    distribution: { "@type": "DataDownload", encodingFormat: "application/ld+json", contentUrl: new URL(`/api/v1/hcu/runs/${run.id}/export`, request.url).toString() },
    additionalProperty: [
      { "@type": "PropertyValue", name: "seed", value: run.seed },
      { "@type": "PropertyValue", name: "inputSha256", value: run.inputHash },
      { "@type": "PropertyValue", name: "outputSha256", value: run.outputHash },
      { "@type": "PropertyValue", name: "output", value: run.output },
    ],
    conditionsOfAccess: "Ejecución privada del investigador autenticado.",
    citation: "Los hashes aportan trazabilidad local; no tienen ancla externa ni certifican inmutabilidad.",
  }

  return NextResponse.json(exportRecord, { headers: { "Content-Type": "application/ld+json; charset=utf-8", "Cache-Control": "private, no-store" } })
}
