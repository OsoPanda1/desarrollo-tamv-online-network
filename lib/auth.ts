import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"

const isDevelopment = process.env.NODE_ENV === "development"
const isProduction = process.env.NODE_ENV === "production"

function trustedOrigin(value?: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`)
    const isLocalDevelopmentOrigin =
      isDevelopment &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.protocol === "http:"
    if (url.protocol !== "https:" && !isLocalDevelopmentOrigin) return null
    if (url.username || url.password) return null
    return url.origin
  } catch {
    return null
  }
}

const configuredTrustedOrigins = [
  ...(isDevelopment ? ["http://localhost:3000", process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL] : []),
  process.env.APP_URL,
  process.env.BETTER_AUTH_URL,
  ...(isProduction ? [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL] : []),
]
const trustedOrigins = [...new Set(configuredTrustedOrigins.map(trustedOrigin).filter((origin): origin is string => origin !== null))]

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(isDevelopment
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
