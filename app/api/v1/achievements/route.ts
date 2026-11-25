import { auth } from "@/lib/auth"
import { getAchievementView } from "@/lib/achievements/view"
import { apiJson } from "@/lib/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * The catalogue is public. The earned state is only computed for the signed-in
 * owner, from aggregate counts of their own records.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  const view = await getAchievementView(session?.user?.id ?? null)
  return apiJson(view, 200)
}
