import type { Metadata } from "next"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { EcosystemMetadataBoard } from "@/components/ecosystem-metadata-board"
import { TamvMindMap } from "@/components/tamv-mind-map"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "TAMV ecosystem — repository metadata",
        description: "Inspect public GitHub metadata for the eight systems catalogued by TAMV Online Network, with explicit limits on what each status means.",
      }
    : {
        title: "Ecosistema TAMV — metadatos de repositorios",
        description: "Consulta metadatos públicos de GitHub de los ocho sistemas catalogados por TAMV Online Network, con límites explícitos de cada estado.",
      }
}

export default async function EcosystemPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="10"
        eyebrow={english ? "ECOSYSTEM / PUBLIC SOURCE METADATA" : "ECOSISTEMA / METADATOS PÚBLICOS DE ORIGEN"}
        title={english ? "Eight repositories." : "Ocho repositorios."}
        accent={english ? "Evidence, not assumptions." : "Evidencia, no suposiciones."}
        description={english
          ? "Inspect public GitHub repository metadata for each catalogued system. This dashboard distinguishes source availability from deployed application health and actual interoperability."
          : "Consulta los metadatos públicos de GitHub de cada sistema catalogado. Este tablero distingue la disponibilidad de una fuente de la salud de la aplicación desplegada y de la interoperabilidad real."}
        locale={locale}
        actions={<LanguageSwitch pathname="/ecosistema" locale={locale} />}
      />
      <TamvMindMap mapId="federation" locale={locale} />
      <section className="section ecosystem-status-section">
        <div className="container">
          <EcosystemMetadataBoard locale={locale} />
        </div>
      </section>
    </TamvAppShell>
  )
}
