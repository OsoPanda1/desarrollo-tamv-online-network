import "server-only"

export class StripeApiError extends Error {
  readonly status: number
  readonly requestId: string | null

  constructor(status: number, requestId: string | null) {
    super(`Stripe request failed with status ${status}.`)
    this.name = "StripeApiError"
    this.status = status
    this.requestId = requestId
  }
}

export function getStripeSecret(): string | null {
  const value = process.env.STRIPE_SECRET_KEY?.trim()
  return value && /^sk_(test|live)_[A-Za-z0-9]+$/.test(value) ? value : null
}

export function getAppBaseUrl(): string | null {
  const configured = process.env.APP_URL?.trim() || process.env.BETTER_AUTH_URL?.trim()
  const fallbackHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim()
  const raw = configured || (fallbackHost ? `https://${fallbackHost}` : "")
  if (!raw) return process.env.NODE_ENV === "development" ? "http://localhost:3000" : null

  try {
    const url = new URL(raw)
    const localDevelopment =
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    if ((!localDevelopment && url.protocol !== "https:") || url.username || url.password || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

export async function stripePost<T>(
  endpoint: string,
  form: URLSearchParams,
  idempotencyKey?: string,
): Promise<T> {
  const secret = getStripeSecret()
  if (!secret) throw new Error("Stripe is not configured.")

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/x-www-form-urlencoded",
  }
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey

  const response = await fetch(`https://api.stripe.com/v1/${endpoint.replace(/^\/+/, "")}`, {
    method: "POST",
    headers,
    body: form.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  })

  if (!response.ok) {
    const requestId = response.headers.get("request-id")
    console.error("TAMV Stripe API request failed", { endpoint, status: response.status, requestId })
    throw new StripeApiError(response.status, requestId)
  }

  return (await response.json()) as T
}
