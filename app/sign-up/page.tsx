import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { getServerSession } from "@/lib/auth-helpers"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return { title: english ? "Create a research account" : "Crear cuenta de investigación", robots: { index: false } }
}

export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const session = await getServerSession()
  if (session?.user) redirect("/portal")
  return <TamvAppShell locale={locale}><section className="auth-section container"><AuthForm mode="sign-up" locale={locale} /></section></TamvAppShell>
}
