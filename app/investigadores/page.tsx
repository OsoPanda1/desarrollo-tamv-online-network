import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { getPublicResearchers } from "@/lib/research/queries"
import { resolveLocale } from "@/lib/i18n"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Researcher directory", description: "Research profiles made public with the profile owner's explicit consent." }
    : { title: "Directorio de investigadores", description: "Perfiles de investigación publicados con consentimiento explícito." }
}

export default async function ResearchersPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const researchers = await getPublicResearchers()
  return <TamvAppShell locale={locale}>
    <PageIntro number="07" eyebrow={english ? "RESEARCHER DIRECTORY" : "DIRECTORIO DE INVESTIGACIÓN"} title={english ? "People, research lines" : "Personas, líneas"} accent={english ? "and context." : "y contexto."} description={english ? "Only profiles whose owners opted in are listed. Identifiers are shown as declared; the directory does not certify identity or affiliation." : "Solo aparecen perfiles que activaron la publicación. Los identificadores se muestran como declarados; el directorio no certifica afiliación ni identidad."} locale={locale} actions={<LanguageSwitch pathname="/investigadores" locale={locale} />} />
    <section className="section public-list-section"><div className="container"><div className="public-list-heading"><div><p className="eyebrow">{english ? "PUBLIC PROFILES" : "PERFILES PÚBLICOS"}</p><h2>{english ? "A directory chosen by its members." : "Un directorio elegido por sus titulares."}</h2></div><p>{english ? "Email addresses, private proposals, and collaboration interests are not listed." : "El correo, las propuestas privadas y los intereses de colaboración no forman parte del directorio."}</p></div>
      {researchers.length ? <div className="researcher-grid">{researchers.map((researcher) => <article className="researcher-card" key={researcher.id}><p className="eyebrow">{researcher.roleCode ?? (english ? "RESEARCHER" : "INVESTIGADOR/A")}</p><h2>{researcher.publicName}</h2>{researcher.affiliation && <p>{researcher.affiliation}</p>}<div className="researcher-identifiers">{researcher.tri && <span>TRI · {researcher.tri}</span>}{researcher.orcid && <a href={`https://orcid.org/${researcher.orcid}`} target="_blank" rel="noopener noreferrer">ORCID · {researcher.orcid} <ArrowUpRight aria-hidden="true" /></a>}{researcher.isni && <span>ISNI · {researcher.isni}</span>}</div><ul className="research-lines">{researcher.researchLines.map((line) => <li key={line}>{line}</li>)}</ul><small>{english ? "Record status" : "Estado del registro"}: {researcher.verificationStatus}</small></article>)}</div> : <div className="empty-panel"><h2>{english ? "There are no public profiles yet." : "Aún no hay perfiles públicos."}</h2><p>{english ? "The directory only lists people who enable this option." : "El directorio solo muestra a quien activa esa opción desde su perfil."}</p><Link className="text-link" href="/portal/perfil">{english ? "Configure my profile" : "Configurar mi perfil"} <ArrowUpRight aria-hidden="true" /></Link></div>}
    </div></section>
  </TamvAppShell>
}
