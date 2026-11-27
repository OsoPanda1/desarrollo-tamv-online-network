import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, FileCheck2, Landmark, ShieldCheck, Users } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>
export const dynamic = "force-dynamic"

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Institutionalization and ROR roadmap",
        description: "A transparent, future-oriented roadmap for TAMV legal formalization, institutional evidence and possible ROR registry inclusion.",
      }
    : {
        title: "Ruta de institucionalización y ROR",
        description: "Ruta transparente y futura para la formalización jurídica de TAMV, evidencia institucional y una posible inclusión en el registro ROR.",
      }
}

export default async function InstitutionalizationPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"

  return <TamvAppShell locale={locale}>
    <PageIntro
      eyebrow={english ? "INSTITUTIONAL ROADMAP · GOVERNANCE" : "HOJA DE RUTA INSTITUCIONAL · GOBERNANZA"}
      title={english ? "Build institutional foundations." : "Construir una base institucional."}
      accent={english ? "With evidence, accountability and community support." : "Con evidencia, rendición de cuentas y apoyo comunitario."}
      description={english
        ? "Membership revenue may help fund future legal formalization and the development of TAMV as a durable research organization, if revenue, governance and professional review make it viable. This is a roadmap, not a claim that legal incorporation or a ROR ID already exists."
        : "Los ingresos futuros por membresías podrían contribuir a la formalización jurídica y a consolidar TAMV como una organización de investigación duradera, si los recursos, la gobernanza y la revisión profesional lo hacen viable. Esta es una hoja de ruta; no afirma que la constitución legal o un ROR ID ya existan."
      }
    />
    <section className="section"><div className="container membership-institutional-roadmap">
      <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p><strong>{english ? "Status: proposed future objective." : "Estado: objetivo futuro propuesto."}</strong> {english
        ? "No fixed share of current membership fees is earmarked for incorporation. No legal form, incorporation date, funding amount or ROR approval is promised."
        : "No hay una proporción fija de las cuotas actuales reservada para constituir la entidad. No se promete una figura legal, fecha de constitución, monto de financiamiento ni aprobación de ROR."}</p></div>

      <div className="membership-roadmap-grid">
        <article className="membership-roadmap-card">
          <Landmark aria-hidden="true" />
          <p className="eyebrow">{english ? "01 / LEGAL FOUNDATION" : "01 / BASE JURÍDICA"}</p>
          <h2>{english ? "Define and formalize the operating entity" : "Definir y formalizar la entidad operadora"}</h2>
          <p>{english
            ? "Subject to professional advice in Mexico, determine the appropriate legal form, founding documents, ownership and governance rules, tax obligations, accounting, contracts and institutional policies."
            : "Con asesoría profesional en México, determinar la figura jurídica adecuada, documentos constitutivos, reglas de propiedad y gobernanza, obligaciones fiscales, contabilidad, contratos y políticas institucionales."}</p>
        </article>
        <article className="membership-roadmap-card">
          <FileCheck2 aria-hidden="true" />
          <p className="eyebrow">{english ? "02 / RESEARCH EVIDENCE" : "02 / EVIDENCIA DE INVESTIGACIÓN"}</p>
          <h2>{english ? "Document a durable research organization" : "Documentar una organización de investigación duradera"}</h2>
          <p>{english
            ? "Maintain a stable organization identity, governance and continuity evidence, named research outputs, repository provenance and verifiable affiliations. A project page alone does not prove the existence of an independent organization."
            : "Mantener una identidad institucional estable, evidencia de gobernanza y continuidad, resultados de investigación identificables, procedencia en repositorios y afiliaciones verificables. Una página de proyecto por sí sola no prueba la existencia de una organización independiente."}</p>
        </article>
        <article className="membership-roadmap-card">
          <Users aria-hidden="true" />
          <p className="eyebrow">{english ? "03 / COMMUNITY RESOURCES" : "03 / RECURSOS COMUNITARIOS"}</p>
          <h2>{english ? "Allocate funds only with transparent approval" : "Asignar recursos solo con aprobación transparente"}</h2>
          <p>{english
            ? "If future net operating revenue allows, TAMV's designated governance body could approve a documented budget for legal and administrative costs. Gross sales, taxes, payment fees, refunds and essential operating costs must be reconciled first."
            : "Si los futuros ingresos netos de operación lo permiten, el órgano de gobernanza designado por TAMV podría aprobar un presupuesto documentado para costos jurídicos y administrativos. Antes se deben conciliar ventas brutas, impuestos, comisiones de pago, reembolsos y gastos operativos esenciales."}</p>
        </article>
      </div>

      <h2>{english ? "ROR is an identifier, not legal incorporation" : "ROR es un identificador, no una constitución legal"}</h2>
      <p>{english
        ? "The Research Organization Registry (ROR) provides persistent identifiers for research organizations. ROR states that an organization does not have to be a legal entity to qualify, but it must fit the registry's scope as a collective, enduring organization involved in research. Registry inclusion is curated and evidence-based; it is not an accreditation or a quality endorsement."
        : "El Research Organization Registry (ROR) asigna identificadores persistentes a organizaciones de investigación. ROR indica que una organización no tiene que ser una entidad jurídica para ser elegible, pero debe encajar en el alcance del registro como organización colectiva y duradera que participa en investigación. La inclusión pasa por curaduría basada en evidencia; no es una acreditación ni un aval de calidad."}</p>
      <p>{english
        ? "ROR's identifier and data are free to access and use. The budget target is therefore legal, accounting, administrative and evidence-preparation work—not a fee to buy a ROR ID."
        : "El identificador y los datos de ROR son gratuitos. El objetivo presupuestario sería cubrir trabajo jurídico, contable, administrativo y de preparación de evidencias; no pagar para comprar un ROR ID."}</p>
      <p className="membership-external-links">
        <a className="text-link" href="https://ror.org/about" target="_blank" rel="noopener noreferrer">{english ? "What ROR is" : "Qué es ROR"} <ArrowUpRight aria-hidden="true" /></a>
        <a className="text-link" href="https://ror.org/about/faqs/" target="_blank" rel="noopener noreferrer">{english ? "ROR FAQs" : "Preguntas frecuentes de ROR"} <ArrowUpRight aria-hidden="true" /></a>
        <a className="text-link" href="https://ror.org/registry" target="_blank" rel="noopener noreferrer">{english ? "Scope and inclusion criteria" : "Alcance y criterios de inclusión"} <ArrowUpRight aria-hidden="true" /></a>
      </p>

      <h2>{english ? "Financial accountability before allocating membership revenue" : "Rendición de cuentas antes de asignar ingresos de membresías"}</h2>
      <ol>
        <li>{english ? "Approve a formal internal resolution, named responsible persons, scope, budget and reporting cadence." : "Aprobar una resolución interna formal, responsables identificados, alcance, presupuesto y periodicidad de reportes."}</li>
        <li>{english ? "Publish categories and estimates only when quotes and a real budget exist; do not invent a target percentage." : "Publicar categorías y estimaciones solo cuando existan cotizaciones y un presupuesto real; no inventar un porcentaje objetivo."}</li>
        <li>{english ? "Report actual net revenue allocated and supported expenses, protecting member data and confidential financial details." : "Informar los ingresos netos efectivamente asignados y los gastos respaldados, protegiendo datos de miembros y detalles financieros confidenciales."}</li>
        <li>{english ? "Report each milestone separately: legal planning, incorporation completed, ROR request submitted, and ROR record published." : "Informar cada hito por separado: planeación jurídica, constitución completada, solicitud ROR presentada y ficha ROR publicada."}</li>
      </ol>
      <p>{english
        ? "A membership is a subscription to the published TAMV service scope; it is not a donation restricted to incorporation, an equity investment, a share of ownership, or a promise of a future legal status."
        : "La membresía es una suscripción al alcance publicado del servicio TAMV; no es una donación restringida a la constitución, una inversión de capital, una participación de propiedad ni una promesa de estatus jurídico futuro."}</p>
      <p><Link className="text-link" href={english ? "/membresias?lang=en" : "/membresias"}>{english ? "Review memberships and conditions" : "Consultar membresías y condiciones"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>
  <TamvSectionMedia area="institutionalization" locale={locale} />
      </TamvAppShell>
}
