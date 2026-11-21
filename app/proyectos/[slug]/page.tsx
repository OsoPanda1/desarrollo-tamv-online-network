import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { projectCategoryLabel, resolveLocale } from "@/lib/i18n"
import { getPublicProject } from "@/lib/research/queries"

export const dynamic = "force-dynamic"
type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const project = await getPublicProject(slug)
  const english = resolveLocale(query.lang) === "en"
  return project
    ? { title: english ? project.titleEn : project.titleEs, description: english ? project.descriptionEn : project.descriptionEs }
    : { title: english ? "TAMV project" : "Proyecto TAMV" }
}

export default async function ProjectDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const locale = resolveLocale(query.lang)
  const english = locale === "en"
  const project = await getPublicProject(slug)
  if (!project) notFound()
  return <TamvAppShell locale={locale}>
    <PageIntro number="02" eyebrow={projectCategoryLabel(project.category, locale)} title={english ? project.titleEn : project.titleEs} accent={english ? project.subtitleEn : project.subtitleEs} description={english ? project.descriptionEn : project.descriptionEs} locale={locale} actions={<><LanguageSwitch pathname={`/proyectos/${project.slug}`} locale={locale} /><Link className="text-link" href={`/proyectos?lang=${locale}`}><ArrowLeft aria-hidden="true" /> {english ? "All projects" : "Todos los proyectos"}</Link></>} />
    <section className="section public-detail-section"><div className="container detail-layout">
      <div className="detail-main"><p className="eyebrow">{english ? "PROJECT RECORD" : "FICHA DE PROYECTO"}</p><h2>{english ? "Scope and current maturity" : "Alcance y madurez declarada"}</h2><p className="detail-lead">{english ? project.maturity : project.maturity}</p><p className="detail-body">{english ? project.limitsEn : project.limitsEs}</p>
        <div className="provenance-panel"><h3>{english ? "Provenance" : "Procedencia"}</h3><dl><div><dt>{english ? "Source" : "Fuente"}</dt><dd>{project.sourceUrl ? <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{project.sourceUrl} <ExternalLink aria-hidden="true" /></a> : (english ? "No source link supplied" : "No se proporcionó enlace de fuente")}</dd></div><div><dt>{english ? "Inspected commit" : "Commit registrado"}</dt><dd><code>{project.sourceCommit ?? (english ? "Not recorded" : "No registrado")}</code></dd></div><div><dt>{english ? "License" : "Licencia"}</dt><dd>{project.license ?? (english ? "Not declared; reuse rights are not implied." : "No declarada; no se presumen permisos de reutilización.")}</dd></div><div><dt>{english ? "Catalog status" : "Estado del catálogo"}</dt><dd>{project.verificationStatus.replaceAll("_", " ")}</dd></div></dl></div>
        <div className="detail-note"><strong>{english ? "Read with care" : "Lectura responsable"}</strong><span>{english ? "A source commit identifies a snapshot, not an independent audit, production deployment, security certification, or measured impact." : "El commit identifica una versión de fuente, no una auditoría independiente, despliegue productivo, certificación de seguridad ni impacto medido."}</span></div>
      </div>
      <aside className="detail-aside"><p className="eyebrow">{english ? "INTEROPERABLE METADATA" : "METADATOS INTEROPERABLES"}</p><h2>{english ? "Cite the record." : "Cita el registro."}</h2><p>{english ? "Public project metadata is available in JSON-LD and CSV. The license is shown per record; missing licenses remain unspecified." : "Los metadatos públicos del proyecto están disponibles en JSON-LD y CSV. La licencia se informa por registro; si falta, permanece sin especificar."}</p><Link className="button button-copper" href="/api/v1/exports/research">{english ? "FAIR-oriented export" : "Exportación FAIR"} <ArrowUpRight aria-hidden="true" /></Link><Link className="text-link" href={`/api/v1/exports/research?format=csv`}>CSV <ArrowUpRight aria-hidden="true" /></Link></aside>
    </div></section>
  </TamvAppShell>
}
