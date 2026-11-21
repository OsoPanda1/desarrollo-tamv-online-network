import { auth } from "@/lib/auth"
import { getUserHcuRuns } from "@/lib/research/queries"
import { apiError, apiJson } from "@/lib/http"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return apiError("Inicia sesión para consultar tus simulaciones.", 401)
  return apiJson({ records: await getUserHcuRuns(session.user.id) })
}
