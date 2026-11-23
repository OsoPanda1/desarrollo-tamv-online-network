import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { getServerSession } from "@/lib/auth-helpers"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string; next?: string; callbackURL?: string }>

function resolveInternalRedirect(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\\\")) return "/portal"
  try {
    const url = new URL(value, "https://tamv.invalid")
    if (url.origin !== "https://tamv.invalid") return "/portal"
    if (url.pathname === "/sign-in" || url.pathname === "/sign-up") return "/portal"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/portal"
  }
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return { title: english ? "Sign in" : "Iniciar sesión", robots: { index: false } }
}

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const locale = resolveLocale(params.lang)
  const redirectTo = resolveInternalRedirect(params.callbackURL ?? params.next)
  const session = await getServerSession()
  if (session?.user) redirect(redirectTo)
  return <TamvAppShell locale={locale}><section className="auth-section container"><AuthForm mode="sign-in" locale={locale} redirectTo={redirectTo} /></section></TamvAppShell>
}
