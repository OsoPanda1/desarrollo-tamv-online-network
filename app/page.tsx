import type { Metadata } from "next"
import { TamvInstitutionalSite } from "@/components/tamv-institutional-site"
import { resolveLocale } from "@/lib/i18n"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Research, technology, and living memory", description: "An independent Mexican initiative connecting research, technology, and territorial memory through a Latin American perspective.", openGraph: { locale: "en_US", title: "TAMV Online Network — Research, technology, and living memory" } }
    : { title: "Investigación, tecnología y memoria viva", description: "Iniciativa mexicana independiente que conecta investigación, tecnología y memoria territorial desde una perspectiva latinoamericana.", openGraph: { locale: "es_MX", title: "TAMV Online Network — Investigación, tecnología y memoria viva" } }
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  return <TamvInstitutionalSite locale={locale} />
}
