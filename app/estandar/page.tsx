import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Braces, FileCheck2, Globe2, Scale, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { StandardEvaluator } from "@/components/standard-evaluator"
import { resolveLocale } from "@/lib/i18n"
import {
  PILLARS,
  REFERENCES,
  REFERENCE_GROUPS,
  STANDARD_ID,
  STANDARD_LIMITATIONS_EN,
  STANDARD_LIMITATIONS_ES,
  STANDARD_NAME_EN,
  STANDARD_NAME_ES,
  STANDARD_SEMANTICS_EN,
  STANDARD_SEMANTICS_ES,
  STANDARD_SHORT_EN,
  STANDARD_SHORT_ES,
  STANDARD_STATUS,
  STANDARD_VERSION,
} from "@/lib/standard"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "TAMV Open Integrity Standard (TOIS) v1",
        description:
          "A public, structural standard for classifying, funding, publishing and qualifying certification claims. Includes an evaluator, API, CLI, tests and explicit limitations.",
        openGraph: {
          title: "TAMV Open Integrity Standard — TOIS v1",
          description:
            "Classification, funding, publication and certification claims in one auditable declaration. Structural evaluation, not certification.",
        },
      }
    : {
        title: "Estándar TAMV de Integridad Abierta (ETIA) v1",
        description:
          "Estándar público y estructural para clasificar, recaudar, publicar y cualificar afirmaciones de certificación. Incluye evaluador, API, CLI, pruebas y límites explícitos.",
        openGraph: {
          title: "Estándar TAMV de Integridad Abierta — ETIA v1",
          description:
            "Clasificación, recaudación, publicación y certificación en una sola declaración auditable. Evaluación estructural, no certificación.",
        },
      }
}

const API_ROWS = [
  {
    method: "GET",
    path: "/api/v1/standard",
    es: "Catálogo: pilares, vocabularios, niveles y límites.",
    en: "Catalog: pillars, vocabularies, levels and limitations.",
  },
  {
    method: "GET",
    path: "/api/v1/standard/references",
    es: "Qué hace y qué no hace cada sistema externo citado.",
    en: "What each cited external system does and does not do.",
  },
  {
    method: "GET",
    path: "/api/v1/standard/schema",
    es: "Proyección JSON Schema del esquema de declaración.",
    en: "JSON Schema projection of the declaration schema.",
  },
  {
    method: "POST",
    path: "/api/v1/standard/evaluate",
    es: "Evaluación estructural sin estado; devuelve informe y digest.",
    en: "Stateless structural evaluation; returns a report and digest.",
  },
]

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  const names = english ? STANDARD_NAME_EN : STANDARD_NAME_ES
  const short = english ? STANDARD_SHORT_EN : STANDARD_SHORT_ES
  const limitations = english ? STANDARD_LIMITATIONS_EN : STANDARD_LIMITATIONS_ES

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number={STANDARD_VERSION}
        eyebrow={english ? "Public standard" : "Estándar público"}
        title={names}
        accent={`(${short})`}
        description={
          english
            ? "A single declaration to classify a subject, expose its funding, describe its publication and bound its certification claims. It evaluates structure and consistency; it never certifies truth."
            : "Una sola declaración para clasificar un sujeto, exponer su recaudación, describir su publicación y acotar sus afirmaciones de certificación. Evalúa estructura y coherencia; nunca certifica la verdad."
        }
        locale={locale}
        actions={<LanguageSwitch pathname="/estandar" locale={locale} />}
      />

      <section className="section etia-page-section">
        <div className="container">
          <div className="governance-notice etia-notice">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>
                {english ? "Status: public draft, not a certification scheme" : "Estado: borrador público, no un esquema de certificación"}
              </strong>
              <p>{english ? STANDARD_SEMANTICS_EN : STANDARD_SEMANTICS_ES}</p>
              <p className="etia-id">
                <code>{STANDARD_ID}</code> · v{STANDARD_VERSION} · {STANDARD_STATUS}
              </p>
            </div>
          </div>

          <div className="etia-principles">
            <article>
              <FileCheck2 aria-hidden="true" />
              <h2>{english ? "Structural, not evidential" : "Estructural, no probatorio"}</h2>
              <p>
                {english
                  ? "The evaluator reads what is declared, checks formats and internal contradictions, and states what it did not check."
                  : "El evaluador lee lo declarado, comprueba formatos y contradicciones internas, y declara lo que no comprobó."}
              </p>
            </article>
            <article>
              <Scale aria-hidden="true" />
              <h2>{english ? "Legal gaps made visible" : "Lagunas legales visibles"}</h2>
              <p>
                {english
                  ? "Fiscal sponsorship, charitable solicitation, sanctions and data protection are jurisdiction-specific. The standard links policies instead of pretending they are universal."
                  : "El patrocinio fiscal, la solicitud caritativa, las sanciones y la protección de datos dependen de la jurisdicción. El estándar enlaza políticas en lugar de fingir que son universales."}
              </p>
            </article>
            <article>
              <Globe2 aria-hidden="true" />
              <h2>{english ? "Identifiers are not certificates" : "Los identificadores no son certificados"}</h2>
              <p>
                {english
                  ? "ISNI, ROR, ORCID and DOI identify entities or objects. OSF, Zenodo and CERN preserve and publish. None of them certifies quality or truth."
                  : "ISNI, ROR, ORCID y DOI identifican entidades u objetos. OSF, Zenodo y CERN preservan y publican. Ninguno certifica calidad ni verdad."}
              </p>
            </article>
          </div>

          <div className="etia-section-head">
            <p className="eyebrow">{english ? "01 / Method" : "01 / Método"}</p>
            <h2>{english ? "Four pillars and one cross-cutting layer" : "Cuatro pilares y una capa transversal"}</h2>
            <p>
              {english
                ? "Every pillar produces pass, warning, fail or not-applicable checks. The overall outcome is complete, conditional or blocked — a statement about the declaration, never about the subject's truth."
                : "Cada pilar produce comprobaciones de cumple, advertencia, fallo o no aplica. El resultado global es completa, condicional o bloqueada: una afirmación sobre la declaración, nunca sobre la verdad del sujeto."}
            </p>
          </div>

          <div className="etia-pillar-grid">
            {PILLARS.map((pillar, index) => (
              <article key={pillar.id}>
                <span className="etia-pillar-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{english ? pillar.nameEn : pillar.nameEs}</h3>
                <p>{english ? pillar.purposeEn : pillar.purposeEs}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section etia-page-section">
        <div className="container">
          <div className="etia-section-head">
            <p className="eyebrow">{english ? "02 / Evaluator" : "02 / Evaluador"}</p>
            <h2>{english ? "Evaluate a declaration" : "Evalúa una declaración"}</h2>
            <p>
              {english
                ? "Paste a declaration or load the fictional example. The report is computed locally, includes a SHA-256 digest, and repeats identically for the same input and reference date."
                : "Pega una declaración o carga el ejemplo ficticio. El informe se calcula localmente, incluye un digest SHA-256 y se repite de forma idéntica para la misma entrada y fecha de referencia."}
            </p>
          </div>
          <StandardEvaluator locale={locale} />
        </div>
      </section>

      <section className="section etia-page-section">
        <div className="container">
          <div className="etia-section-head">
            <p className="eyebrow">{english ? "03 / API and CLI" : "03 / API y CLI"}</p>
            <h2>{english ? "Runnable, versioned, testable" : "Ejecutable, versionado, comprobable"}</h2>
            <p>
              {english
                ? "The same evaluator is exposed as a stateless API route and as a command-line checker. The repository includes contract tests and an OpenAPI document."
                : "El mismo evaluador se expone como ruta de API sin estado y como comprobador de línea de comandos. El repositorio incluye pruebas de contrato y un documento OpenAPI."}
            </p>
          </div>

          <div className="api-endpoint-list etia-endpoints">
            {API_ROWS.map((row) => (
              <div key={row.path} className="api-endpoint">
                <span className={`api-method api-method-${row.method.toLowerCase()}`}>{row.method}</span>
                <code>{row.path}</code>
                <span>{english ? row.en : row.es}</span>
              </div>
            ))}
          </div>

          <div className="etia-code-grid">
            <div>
              <h3>{english ? "Evaluate with curl" : "Evaluar con curl"}</h3>
              <pre>
                <code>{`curl -sS -X POST https://tamv.online/api/v1/standard/evaluate \\
  -H "content-type: application/json" \\
  --data-binary @examples/standard-declaration.json`}</code>
              </pre>
            </div>
            <div>
              <h3>{english ? "Run the local checker" : "Ejecutar el comprobador local"}</h3>
              <pre>
                <code>{`npm run standard:check -- \\
  examples/standard-declaration.json \\
  --reference-date 2026-11-27T00:00:00Z`}</code>
              </pre>
            </div>
          </div>

          <p className="etia-links">
            <a href="/openapi.yaml" target="_blank" rel="noopener noreferrer">
              {english ? "OpenAPI 3.1 contract" : "Contrato OpenAPI 3.1"} <ArrowUpRight aria-hidden="true" />
            </a>
            <a href="/standards/example-declaration.json" target="_blank" rel="noopener noreferrer">
              {english ? "Example declaration" : "Declaración de ejemplo"} <ArrowUpRight aria-hidden="true" />
            </a>
            <Link href={`/desarrolladores?lang=${locale}`}>
              {english ? "Developer quickstart" : "Inicio de desarrollo"} <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href={`/gobernanza?lang=${locale}`}>
              {english ? "Governance" : "Gobernanza"} <ArrowUpRight aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className="section etia-page-section">
        <div className="container">
          <div className="etia-section-head">
            <p className="eyebrow">{english ? "04 / References" : "04 / Referencias"}</p>
            <h2>{english ? "What each source does and does not do" : "Qué hace y qué no hace cada fuente"}</h2>
            <p>
              {english
                ? "The catalog is a reading aid, not an endorsement. Inclusion is not membership, accreditation or evidence of compliance. ISO records are usually paywalled."
                : "El catálogo es una ayuda de lectura, no un respaldo. La inclusión no es membresía, acreditación ni evidencia de cumplimiento. Los registros ISO suelen ser de pago."}
            </p>
          </div>

          <div className="etia-reference-groups">
            {REFERENCE_GROUPS.map((group) => {
              const entries = REFERENCES.filter((reference) => reference.group === group.id)
              if (entries.length === 0) return null
              return (
                <details key={group.id} className="etia-reference-group">
                  <summary>
                    <strong>{english ? group.nameEn : group.nameEs}</strong>
                    <span>{entries.length}</span>
                  </summary>
                  <ul>
                    {entries.map((reference) => (
                      <li key={reference.id}>
                        <p className="etia-reference-name">
                          <a href={reference.url} target="_blank" rel="noopener noreferrer">
                            {reference.name} <ArrowUpRight aria-hidden="true" />
                          </a>
                          <span className={`etia-access etia-access-${reference.access}`}>{reference.access}</span>
                        </p>
                        <p>{english ? reference.whatItDoesEn : reference.whatItDoesEs}</p>
                        <p className="etia-reference-not">
                          <strong>{english ? "Does not: " : "No hace: "}</strong>
                          {english ? reference.whatItDoesNotDoEn : reference.whatItDoesNotDoEs}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section etia-page-section">
        <div className="container">
          <div className="etia-section-head">
            <p className="eyebrow">{english ? "05 / Limits" : "05 / Límites"}</p>
            <h2>{english ? "Known blind spots, stated on purpose" : "Puntos ciegos conocidos, declarados a propósito"}</h2>
          </div>
          <ul className="etia-limitations">
            {limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
          <div className="editorial-caveat">
            <Braces aria-hidden="true" />
            <p>
              {english
                ? "No result from this standard is a certification, an accreditation, a legal opinion or proof that a declaration is true. A third party that needs verification must resolve identifiers, open registries, contact issuers and record what it found."
                : "Ningún resultado de este estándar es una certificación, una acreditación, una opinión legal ni prueba de que una declaración sea verdadera. Un tercero que necesite verificación debe resolver identificadores, abrir registros, contactar emisores y registrar lo encontrado."}
            </p>
          </div>
        </div>
      </section>
    </TamvAppShell>
  )
}
