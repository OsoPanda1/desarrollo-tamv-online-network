import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Download } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"
import { getPublishedProposals } from "@/lib/research/queries"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Publications", description: "Published works with explicit consent and editorial status." }
    : { title: "Publicaciones", description: "Trabajos publicados con consentimiento y estado editorial explícito." }
}

export default async function PublicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const records = await getPublishedProposals()
  return <TamvAppShell locale={locale}>
    <PageIntro number="08" eyebrow={english ? "PUBLICATIONS & RESEARCH" : "PUBLICACIONES E INVESTIGACIÓN"} title={english ? "Work made" : "Trabajo hecho"} accent={english ? "visible by consent." : "visible con consentimiento."} description={english ? "Only records marked published, public, and shared with author consent appear here. The list is an editorial shelf, not a peer-reviewed journal." : "Aquí solo aparecen registros publicados, públicos y compartidos con consentimiento de autoría. Es una estantería editorial, no una revista con revisión por pares."} locale={locale} actions={<LanguageSwitch pathname="/investigacion/publicaciones" locale={locale} />} />
    <section className="section public-list-section"><div className="container"><div className="publication-toolbar"><p>{records.length} {english ? "public records" : "registros públicos"}</p><Link className="text-link" href="/api/v1/exports/research?format=csv">{english ? "Download metadata CSV" : "Descargar metadatos CSV"} <Download aria-hidden="true" /></Link></div>
      {records.length ? <div className="publication-list">{records.map((record) => <article className="publication-card" key={record.id}><div className="directory-card-top"><span>{record.proposalType}</span><span className="status-pill">{english ? "Published" : "Publicado"}</span></div><h2>{record.title}</h2><p>{record.abstract}</p><dl className="proposal-record-data"><div><dt>{english ? "Publication date" : "Fecha de publicación"}</dt><dd>{record.publishedAt?.toLocaleDateString(english ? "en-US" : "es-MX") ?? "—"}</dd></div><div><dt>{english ? "License" : "Licencia"}</dt><dd>{record.license ?? (english ? "Not declared; reuse is not implied." : "No declarada; no se presumen derechos de reutilización.")}</dd></div></dl>{record.sourceUrl && <a className="text-link" href={record.sourceUrl} target="_blank" rel="noopener noreferrer">{english ? "Open source material" : "Abrir material fuente"} <ArrowUpRight aria-hidden="true" /></a>}</article>)}</div> : <div className="empty-panel"><h2>{english ? "No public publications yet." : "Aún no hay publicaciones públicas."}</h2><p>{english ? "Submissions stay private until the editorial process is complete and the author has consented to publication." : "Los envíos se mantienen privados hasta concluir el proceso editorial y contar con el consentimiento de publicación."}</p><Link className="button button-outline-light" href="/portal/propuestas/nueva">{english ? "Propose research" : "Proponer investigación"} <ArrowUpRight aria-hidden="true" /></Link></div>}
    </div></section>
  </TamvAppShell>
}
