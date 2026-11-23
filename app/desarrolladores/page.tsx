import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, Braces, GitBranch, Network, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Developer quickstart and public API",
        description: "Explore the TAMV public API, HCU knowledge graph, JSON-LD and CSV exports, and contribution workflow.",
        openGraph: { title: "TAMV Online Network — Developer interfaces", description: "Reproducible public endpoints, evidence-bounded data, and a clear path to contribute." },
      }
    : {
        title: "Inicio de desarrollo y API pública",
        description: "Explora la API pública de TAMV, el grafo HCU, exportaciones JSON-LD y CSV, y el flujo de contribución.",
        openGraph: { title: "TAMV Online Network — Interfaces para desarrollo", description: "Endpoints públicos reproducibles, datos con límites de evidencia y una ruta clara para contribuir." },
      }
}

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/research/topics",
    accessEs: "Público",
    accessEn: "Public",
    purposeEs: "Temas editoriales con título, pregunta, áreas y modos de colaboración en ES/EN.",
    purposeEn: "Editorial topics with bilingual titles, questions, areas and collaboration modes.",
  },
  {
    method: "GET",
    path: "/api/v1/research/projects",
    accessEs: "Público",
    accessEn: "Public",
    purposeEs: "Proyectos con madurez, límites y procedencia declarada.",
    purposeEn: "Projects with declared maturity, limits, and provenance.",
  },
  {
    method: "GET",
    path: "/api/v1/researchers",
    accessEs: "Público por consentimiento",
    accessEn: "Public opt-in",
    purposeEs: "Perfiles que activaron publicación; no expone correo privado.",
    purposeEn: "Profiles whose owners enabled publication; private email is not exposed.",
  },
  {
    method: "GET",
    path: "/api/v1/exports/research",
    accessEs: "Público · JSON-LD",
    accessEn: "Public · JSON-LD",
    purposeEs: "Catálogo interoperable de proyectos, temas y publicaciones elegibles.",
    purposeEn: "Interoperable catalog of eligible projects, topics, and publications.",
  },
  {
    method: "GET",
    path: "/api/v1/exports/research?format=csv",
    accessEs: "Público · CSV",
    accessEn: "Public · CSV",
    purposeEs: "Exportación tabular de metadatos públicos.",
    purposeEn: "Tabular export of public metadata.",
  },
  {
    method: "GET",
    path: "/api/v1/hcu/graph",
    accessEs: "Público · grafo HCU",
    accessEn: "Public · HCU graph",
    purposeEs: "Dominios, átomos y relaciones del modelo exploratorio.",
    purposeEn: "Domains, atoms, and relationships in the exploratory model.",
  },
]

const contributionPaths = [
  {
    number: "01",
    titleEs: "Documentación y traducción",
    titleEn: "Documentation and translation",
    descriptionEs: "Mejora el inicio rápido, la paridad español/inglés y la claridad de límites técnicos.",
    descriptionEn: "Improve the quickstart, Spanish/English parity, and clarity of technical boundaries.",
  },
  {
    number: "02",
    titleEs: "Pruebas e ingeniería",
    titleEn: "Testing and engineering",
    descriptionEs: "Aporta una prueba reproducible, un caso de error, accesibilidad o una corrección acotada.",
    descriptionEn: "Add a reproducible test, an error case, accessibility work, or a focused fix.",
  },
  {
    number: "03",
    titleEs: "Datos y ciencia abierta",
    titleEn: "Data and open science",
    descriptionEs: "Revisa procedencia, licencia, unidades, versión y el significado de los estados declarados.",
    descriptionEn: "Review provenance, licensing, units, versioning, and the meaning of declared states.",
  },
]

export default async function DevelopersPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const repoUrl = "https://github.com/OsoPanda1/desarrollo-tamv-online-network"
  const issuesUrl = "https://github.com/OsoPanda1/desarrollo-tamv-online-network/issues"

  return <TamvAppShell locale={locale}>
    <PageIntro
      number="06"
      eyebrow={english ? "DEVELOPER INTERFACES / PUBLIC CONTRACTS" : "INTERFACES PARA DESARROLLO / CONTRATOS PÚBLICOS"}
      title={english ? "Make a first" : "Haz tu primera"}
      accent={english ? "useful contribution." : "contribución útil."}
      description={english
        ? "Start with public, versioned data; inspect the HCU exploratory graph; reproduce a request; then choose a focused contribution. You do not need to adopt the entire TAMV architecture to improve one verifiable part."
        : "Empieza con datos públicos versionados; inspecciona el grafo exploratorio HCU; reproduce una solicitud y después elige una contribución acotada. No necesitas adoptar toda la arquitectura TAMV para mejorar una parte verificable."}
      locale={locale}
      actions={<LanguageSwitch pathname="/desarrolladores" locale={locale} />}
    />

    <section className="developer-path-section">
      <div className="container">
        <div className="developer-action-bar">
          <Link className="button button-copper" href={`/hcu?lang=${locale}`}>
            {english ? "Explore the HCU field" : "Explorar el campo HCU"} <ArrowRight aria-hidden="true" />
          </Link>
          <a className="button button-outline-dark" href={repoUrl} target="_blank" rel="noopener noreferrer">
            {english ? "Open GitHub repository" : "Abrir repositorio GitHub"} <ArrowUpRight aria-hidden="true" />
          </a>
          <a className="developer-subtle-link" href={issuesUrl} target="_blank" rel="noopener noreferrer">
            {english ? "Browse issues" : "Explorar incidencias"} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="developer-trust-note">
          <ShieldCheck aria-hidden="true" />
          <p>{english
            ? "Public endpoints expose public records. Proposal, collaboration-interest, and simulation writes require an authenticated same-origin session and server-side validation. A successful page build is not proof that the database or a deployment is healthy."
            : "Los endpoints públicos exponen registros públicos. Las escrituras de propuestas, intereses de colaboración y simulaciones requieren una sesión autenticada del mismo origen y validación del servidor. Una compilación correcta no demuestra que la base de datos ni un despliegue estén saludables."}</p>
        </div>

        <div className="developer-section-heading">
          <p className="eyebrow">{english ? "01 / FIRST VALUE" : "01 / PRIMER RESULTADO ÚTIL"}</p>
          <h2>{english ? "Explore, inspect, then build." : "Explora, inspecciona y después construye."}</h2>
          <p>{english
            ? "Three entry points let new contributors understand a real data contract before taking on an implementation task."
            : "Tres puntos de entrada permiten entender contratos de datos reales antes de asumir una tarea de implementación."}</p>
        </div>

        <div className="developer-entry-grid">
          <article className="developer-entry-card">
            <span className="developer-step">01 / GRAPH</span>
            <Network aria-hidden="true" />
            <h3>{english ? "Explore HCU 3D" : "Explora HCU 3D"}</h3>
            <p>{english ? "Rotate the spatial field, inspect domains and atoms, and read the descriptive metrics with their caveats." : "Rota el campo espacial, inspecciona dominios y átomos y lee las métricas descriptivas junto con sus límites."}</p>
            <Link href={`/hcu?lang=${locale}`}>{english ? "Open the observatory" : "Abrir el observatorio"} <ArrowUpRight aria-hidden="true" /></Link>
          </article>
          <article className="developer-entry-card">
            <span className="developer-step">02 / DATA</span>
            <BookOpen aria-hidden="true" />
            <h3>{english ? "Inspect public exports" : "Inspecciona los exportes públicos"}</h3>
            <p>{english ? "Read JSON-LD or download CSV. Check each record's source, license, maturity and limitations before reuse." : "Consulta JSON-LD o descarga CSV. Comprueba fuente, licencia, madurez y limitaciones antes de reutilizar cada registro."}</p>
            <div className="developer-card-actions">
              <Link href="/api/v1/exports/research">{english ? "JSON-LD" : "JSON-LD"} <ArrowUpRight aria-hidden="true" /></Link>
              <Link href="/api/v1/exports/research?format=csv">CSV <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </article>
          <article className="developer-entry-card">
            <span className="developer-step">03 / CONTRIBUTE</span>
            <GitBranch aria-hidden="true" />
            <h3>{english ? "Choose one focused task" : "Elige una tarea acotada"}</h3>
            <p>{english ? "Start with docs, translation, accessibility, a test, or one issue that has a reproducible acceptance criterion." : "Empieza por documentación, traducción, accesibilidad, una prueba o una incidencia con criterio de aceptación reproducible."}</p>
            <a href={issuesUrl} target="_blank" rel="noopener noreferrer">{english ? "Browse open issues" : "Ver incidencias abiertas"} <ArrowUpRight aria-hidden="true" /></a>
          </article>
        </div>
      </div>
    </section>

    <section className="section developer-quickstart-section" aria-labelledby="developer-quickstart-title">
      <div className="container">
        <div className="developer-section-heading">
          <p className="eyebrow">{english ? "02 / REPRODUCIBLE SETUP" : "02 / PREPARACIÓN REPRODUCIBLE"}</p>
          <h2 id="developer-quickstart-title">{english ? "Run the checks before changing code." : "Ejecuta las comprobaciones antes de cambiar código."}</h2>
          <p>{english
            ? "Use the pinned package manager and a disposable development database. Set the credentials described in .env.example; never use production credentials for local work."
            : "Utiliza el gestor de paquetes fijado y una base de datos de desarrollo desechable. Configura las credenciales descritas en .env.example; nunca uses credenciales de producción para trabajar en local."}</p>
        </div>
        <div className="developer-quickstart-grid">
          <article className="developer-code-panel">
            <div className="developer-code-heading"><span>01 / SETUP</span><strong>{english ? "Local environment" : "Entorno local"}</strong></div>
            <pre><code>{`pnpm install --frozen-lockfile
cp .env.example .env.local
# Configure a test DATABASE_URL
# and a unique BETTER_AUTH_SECRET
pnpm test
pnpm typecheck
pnpm build
pnpm dev`}</code></pre>
            <p>{english ? "Database-backed pages require PostgreSQL. A build does not confirm authentication, migrations or provider integrations." : "Las páginas que dependen de datos requieren PostgreSQL. Una compilación no confirma autenticación, migraciones ni integraciones con proveedores."}</p>
          </article>
          <article className="developer-code-panel">
            <div className="developer-code-heading"><span>02 / FIRST REQUEST</span><strong>{english ? "Public endpoints" : "Endpoints públicos"}</strong></div>
            <pre><code>{`curl -fsS http://localhost:3000/api/v1/hcu/graph
curl -fsS http://localhost:3000/api/v1/research/topics
curl -fsS 'http://localhost:3000/api/v1/exports/research?format=csv' \
  -o tamv-research-export.csv`}</code></pre>
            <p>{english ? "A database outage can return HTTP 503. Treat response shapes and version fields as contracts; do not infer missing licenses or causal meaning." : "Una caída de la base de datos puede devolver HTTP 503. Trata la forma de respuesta y el campo de versión como contratos; no infieras licencias ausentes ni significado causal."}</p>
          </article>
        </div>
        <p className="developer-doc-links">
          <Link href={`/api/v1/exports/research?format=csv`}>{english ? "Download current public metadata" : "Descargar metadatos públicos actuales"} <ArrowUpRight aria-hidden="true" /></Link>
          <a href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">{english ? "Contribution guide" : "Guía de contribución"} <ArrowUpRight aria-hidden="true" /></a>
          <a href="/openapi.yaml" target="_blank" rel="noopener noreferrer">{english ? "OpenAPI 3.1 specification" : "Especificación OpenAPI 3.1"} <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/main/docs/api/public-api-quickstart.md" target="_blank" rel="noopener noreferrer">{english ? "Public API guide" : "Guía de API pública"} <ArrowUpRight aria-hidden="true" /></a>
        </p>
      </div>
    </section>

    <section className="section api-doc-section" aria-labelledby="developer-public-api-title">
      <div className="container">
        <div className="developer-section-heading">
          <p className="eyebrow">{english ? "03 / PUBLIC CONTRACTS" : "03 / CONTRATOS PÚBLICOS"}</p>
          <h2 id="developer-public-api-title">{english ? "Endpoints with explicit boundaries." : "Endpoints con límites explícitos."}</h2>
          <p>{english
            ? "All routes below are implemented in the current repository. Database-backed public reads can return HTTP 503 if the catalog is unavailable."
            : "Las rutas siguientes están implementadas en el repositorio actual. Las lecturas públicas que dependen de la base de datos pueden devolver HTTP 503 si el catálogo no está disponible."}</p>
        </div>
        <div className="api-endpoint-list developer-api-endpoints">
          {endpoints.map((endpoint) => (
            <article className="api-endpoint" key={endpoint.path}>
              <span className="api-method method-get">{endpoint.method}</span>
              <code>{endpoint.path}</code>
              <span className="api-access">{english ? endpoint.accessEn : endpoint.accessEs}</span>
              <p>{english ? endpoint.purposeEn : endpoint.purposeEs}</p>
            </article>
          ))}
        </div>

        <div className="developer-protected-panel">
          <div><ShieldCheck aria-hidden="true" /><div><h3>{english ? "Protected write operations" : "Operaciones de escritura protegidas"}</h3><p>{english
            ? "Proposal submissions, collaboration interests and HCU simulations require an authenticated session and same-origin checks. Private proposals start private; external sharing depends on explicit consent."
            : "El envío de propuestas, los intereses de colaboración y las simulaciones HCU requieren una sesión autenticada y comprobaciones de mismo origen. Las propuestas comienzan privadas; compartir fuera de TAMV depende del consentimiento expreso."}</p></div></div>
          <ul>
            <li><code>POST /api/v1/research/proposals</code><span>{english ? "session + same-origin" : "sesión + mismo origen"}</span></li>
            <li><code>POST /api/v1/research/interests</code><span>{english ? "session + consent settings" : "sesión + configuración de consentimiento"}</span></li>
            <li><code>POST /api/v1/hcu/simulate</code><span>{english ? "session + compute quotas" : "sesión + límites de cálculo"}</span></li>
          </ul>
        </div>
        <p className="editorial-caveat">{english
          ? "A public endpoint is not a guarantee of availability, a source URL is not proof of a claim, and the HCU graph is explicitly exploratory rather than causally validated."
          : "Un endpoint público no garantiza disponibilidad, una URL de fuente no demuestra una afirmación y el grafo HCU es explícitamente exploratorio, no causalmente validado."}</p>
      </div>
    </section>

    <section className="section developer-contribution-section" aria-labelledby="developer-contribution-title">
      <div className="container">
        <div className="developer-section-heading">
          <p className="eyebrow">{english ? "04 / FIRST CONTRIBUTION" : "04 / PRIMERA CONTRIBUCIÓN"}</p>
          <h2 id="developer-contribution-title">{english ? "Start small. Leave evidence." : "Empieza acotado. Deja evidencia."}</h2>
          <p>{english ? "A useful contribution has scope, acceptance criteria, a reproducible result and clear attribution." : "Una contribución útil tiene alcance, criterios de aceptación, resultado reproducible y atribución clara."}</p>
        </div>
        <div className="developer-contribution-grid">
          {contributionPaths.map((path) => (
            <article className="developer-contribution-card" key={path.number}>
              <span>{path.number}</span>
              <h3>{english ? path.titleEn : path.titleEs}</h3>
              <p>{english ? path.descriptionEn : path.descriptionEs}</p>
            </article>
          ))}
        </div>
        <div className="developer-contribution-cta">
          <div><Braces aria-hidden="true" /><p>{english
            ? "Do not submit a broad rewrite before agreeing on its problem statement, acceptance criteria and maintenance cost. All contributions are reviewed; a submission is not a guarantee of acceptance."
            : "No envíes una reescritura amplia antes de acordar problema, criterios de aceptación y coste de mantenimiento. Todas las contribuciones se revisan; el envío no garantiza aceptación."}</p></div>
          <div className="developer-action-bar">
            <a className="button button-copper" href={issuesUrl} target="_blank" rel="noopener noreferrer">{english ? "Choose an issue" : "Elegir una incidencia"} <ArrowUpRight aria-hidden="true" /></a>
            <a className="button button-outline-dark" href={`${repoUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">{english ? "Read contribution rules" : "Leer las reglas de contribución"} <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  </TamvAppShell>
}
