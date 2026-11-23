import type { Metadata } from "next"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvArchitectureReference } from "@/components/tamv-architecture-reference"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Architecture and maturity", description: "A transparent register separating the supplied Isabella Cero blueprint from implemented TAMV website capabilities." }
    : { title: "Arquitectura y madurez", description: "Registro transparente que separa el plano Isabella Cero proporcionado de las capacidades implementadas en el sitio TAMV." }
}

export default async function ArchitecturePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="07" eyebrow={english ? "ARCHITECTURE & MATURITY" : "ARQUITECTURA Y MADUREZ"} title={english ? "Specify clearly." : "Especificar con claridad."} accent={english ? "Implement transparently." : "Implementar con transparencia."} description={english ? "A traceable reading of the supplied Isabella Cero documents, with current runtime boundaries made explicit." : "Una lectura trazable de los documentos Isabella Cero proporcionados, con límites del runtime actual explícitos."} locale={locale} actions={<LanguageSwitch pathname="/arquitectura" locale={locale} />} />
    <section className="section architecture-page-section"><div className="container"><TamvArchitectureReference locale={locale} /></div></section>
  </TamvAppShell>
}
