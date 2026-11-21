import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Braces, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "API and FAIR data", description: "Versioned contracts and public exports for TAMV research topics, projects, and records." }
    : { title: "API y datos FAIR", description: "Contratos versionados y exportaciones públicas para temas, proyectos e investigación TAMV." }
}
const endpoints = [
  { method: "GET", path: "/api/v1/research/topics", access: "Público", purpose: "Temas activos con texto ES/EN, formatos y modos de colaboración." },
  { method: "GET", path: "/api/v1/research/projects", access: "Público", purpose: "Proyectos públicos con madurez, límites y procedencia." },
  { method: "GET", path: "/api/v1/researchers", access: "Público", purpose: "Perfiles cuyo titular activó publicación; nunca incluye correo." },
  { method: "GET", path: "/api/v1/exports/research", access: "Público", purpose: "Catálogo JSON-LD orientado a interoperabilidad y reutilización." },
  { method: "GET", path: "/api/v1/exports/research?format=csv", access: "Público", purpose: "Exportación CSV de metadatos públicos." },
  { method: "GET", path: "/api/v1/hcu/graph", access: "Público", purpose: "Dominios, átomos y relaciones públicas con estado de evidencia." },
  { method: "POST", path: "/api/v1/research/proposals", access: "Sesión requerida", purpose: "Crea una propuesta privada y registra el evento de recepción." },
  { method: "POST", path: "/api/v1/research/interests", access: "Sesión requerida", purpose: "Guarda interés privado; compartirlo externamente es opcional." },
  { method: "POST", path: "/api/v1/hcu/simulate", access: "Sesión requerida", purpose: "Ejecuta y conserva semilla, hashes, versión y resultados." },
]

export default async function DevelopersPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="06" eyebrow={english ? "DEVELOPER INTERFACES" : "INTERFACES PARA DESARROLLO"} title={english ? "Connect to" : "Conecta con"} accent={english ? "documented contracts." : "contratos documentados."} description={english ? "Versioned endpoints expose only public records, while write operations require a signed-in researcher and are scoped to that account." : "Las rutas versionadas exponen solo registros públicos; las escrituras requieren una persona autenticada y quedan asociadas a su cuenta."} locale={locale} actions={<LanguageSwitch pathname="/desarrolladores" locale={locale} />} />
    <section className="section api-doc-section"><div className="container"><div className="api-security-note"><ShieldCheck aria-hidden="true" /><p>{english ? "Private records are never returned by public catalog endpoints. Every user-owned read and write uses the authenticated session user id; authorization is also enforced inside each route." : "Los registros privados nunca se devuelven desde los catálogos públicos. Cada lectura y escritura de datos propios usa el ID de sesión autenticado; la autorización también se verifica dentro de cada ruta."}</p></div>
      <div className="api-endpoint-list">{endpoints.map((endpoint) => <article className="api-endpoint" key={`${endpoint.method}:${endpoint.path}`}><span className={`api-method method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><code>{endpoint.path}</code><span className="api-access">{endpoint.access}</span><p>{endpoint.purpose}</p></article>)}</div>
      <div className="api-callout api-export-callout"><div><p className="eyebrow">{english ? "FAIR-ORIENTED EXPORTS" : "EXPORTACIONES ORIENTADAS A FAIR"}</p><h2>{english ? "Reuse metadata; respect the license." : "Reutiliza metadatos; respeta la licencia."}</h2><p>{english ? "JSON-LD and CSV exports contain public metadata only. An absent license grants no additional reuse rights." : "JSON-LD y CSV incluyen solo metadatos públicos. La ausencia de licencia no concede derechos adicionales de reutilización."}</p></div><Link className="button button-copper" href="/api/v1/exports/research">{english ? "Open JSON-LD" : "Abrir JSON-LD"} <ArrowUpRight aria-hidden="true" /></Link></div>
      <div className="api-rate-limits"><Braces aria-hidden="true" /><div><h3>{english ? "Validation and limits" : "Validación y límites"}</h3><p>{english ? "JSON request bodies are capped at 32 KiB; inputs have field and horizon limits; proposal and interest submissions have per-account daily caps; HCU permits up to 200 Monte Carlo runs and 20 saved simulations per day." : "Los cuerpos JSON se limitan a 32 KiB; cada campo y horizonte tiene límites; propuestas e intereses tienen topes diarios por cuenta; HCU permite hasta 200 corridas Monte Carlo y 20 simulaciones guardadas al día."}</p></div></div>
    </div></section>
  </TamvAppShell>
}
