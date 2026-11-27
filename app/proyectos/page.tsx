import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { projectCategoryLabel, resolveLocale } from "@/lib/i18n"
import { getPublicProjects } from "@/lib/research/queries"

export const dynamic = "force-dynamic"
type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Projects and modules", description: "Public catalog of TAMV projects with maturity, limitations, and provenance." }
    : { title: "Proyectos y módulos", description: "Catálogo público bilingüe de proyectos TAMV con madurez, límites y procedencia." }
}

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const projects = await getPublicProjects()
  return <TamvAppShell locale={locale}>
    <PageIntro number="02" eyebrow={english ? "PROJECTS & MODULES" : "PROYECTOS Y MÓDULOS"} title={english ? "Ideas with" : "Ideas con"} accent={english ? "traceable boundaries." : "límites trazables."} description={english ? "Each project record separates its purpose, maturity, source, license, and limitations. A public listing does not imply a deployed service or independent audit." : "Cada registro separa propósito, madurez, fuente, licencia y límites. Aparecer en el catálogo no implica un servicio desplegado ni una auditoría independiente."} locale={locale} actions={<LanguageSwitch pathname="/proyectos" locale={locale} />} />
    <section className="section public-list-section"><div className="container">
      <div className="public-list-heading"><div><p className="eyebrow">{english ? "CATALOG" : "CATÁLOGO"}</p><h2>{english ? "The ecosystem, one record at a time." : "El ecosistema, registro por registro."}</h2></div><p>{english ? "The catalog currently includes {n} public project records.".replace("{n}", String(projects.length)) : `El catálogo contiene ${projects.length} registros públicos de proyecto.`}</p></div>
      <div className="project-directory-grid">{projects.map((project) => <article className="project-directory-card" key={project.id}>
        <div className="directory-card-top"><span>{projectCategoryLabel(project.category, locale)}</span><span className="status-pill">{project.maturity}</span></div>
        <p className="project-subtitle">{english ? project.subtitleEn : project.subtitleEs}</p>
        <h2><Link href={`/proyectos/${project.slug}?lang=${locale}`}>{english ? project.titleEn : project.titleEs}</Link></h2>
        <p>{english ? project.descriptionEn : project.descriptionEs}</p>
        <p className="project-provenance">{english ? "Record status" : "Estado del registro"}: {project.verificationStatus.replaceAll("_", " ")}</p>
        <Link className="text-link" href={`/proyectos/${project.slug}?lang=${locale}`}>{english ? "View record" : "Ver ficha"} <ArrowUpRight aria-hidden="true" /></Link>
      </article>)}</div>
      <p className="editorial-caveat">{english ? "Maturity terms are descriptive labels from project documentation, not a standardized readiness score." : "Las etiquetas de madurez describen el material del proyecto; no constituyen una escala estandarizada de preparación."}</p>
      <p><Link className="text-link" href={`/isabella?lang=${locale}`}>{english ? "Isabella AI / TINA — governed federated intelligence, 54% overall progress, not certified for production" : "Isabella AI / TINA — inteligencia federada gobernada, 54% de avance global, no certificada para producción"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>
  <TamvSectionMedia area="projects" locale={locale} />
      </TamvAppShell>
}
