import type { Metadata } from "next"
import { TamvInstitutionalSite } from "@/components/tamv-institutional-site"
import { resolveLocale } from "@/lib/i18n"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "TAMV Living Atlas — Sovereign digital infrastructure", description: "Explore the seven documented domains, public evidence tools, open research records, and governance boundaries of TAMV Online Network.", openGraph: { locale: "en_US", title: "TAMV Living Atlas — Sovereign digital infrastructure" } }
    : { title: "TAMV Living Atlas — Infraestructura digital soberana", description: "Explora los siete ámbitos documentados, las herramientas públicas de evidencia, los registros científicos y los límites de gobernanza de TAMV Online Network.", openGraph: { locale: "es_MX", title: "TAMV Living Atlas — Infraestructura digital soberana" } }
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  return <TamvInstitutionalSite locale={locale} />
}
