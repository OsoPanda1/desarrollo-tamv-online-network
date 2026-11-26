import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Braces, FileCheck2, Fingerprint, Scale, ShieldCheck } from "lucide-react"

import { ReceiptBuilder } from "@/components/evidence/receipt-builder"
import { ReceiptVerifier } from "@/components/evidence/receipt-verifier"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { RECEIPT_LEVELS, RECEIPT_SCHEMA, RECEIPT_SEMANTICS, RECEIPT_SEMANTICS_ES } from "@/lib/evidence/receipt"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? {
        title: "Independent developer module — evidence receipts",
        description:
          "Create and verify a portable TAMV evidence receipt: local SHA-256 digests, strict canonical JSON, explicit limits, and no truth or payment claims.",
      }
    : {
        title: "Módulo de desarrollador independiente — comprobantes de evidencia",
        description:
          "Crea y verifica un comprobante de evidencia TAMV portable: SHA-256 local, JSON canónico estricto, límites explícitos y ninguna promesa de verdad o pago.",
      }
}

const principles = [
  {
    icon: Fingerprint,
    es: {
      title: "La huella no es el archivo",
      body: "El navegador calcula SHA-256 y el archivo permanece en tu dispositivo. La huella vincula bytes solo cuando quien verifica también posee el archivo.",
    },
    en: {
      title: "A digest is not the file",
      body: "The browser computes SHA-256 and the file stays on your device. The digest binds bytes only when the verifier also holds the file.",
    },
  },
  {
    icon: ShieldCheck,
    es: {
      title: "El sello no es una firma",
      body: "Un hash reproducible detecta cambios en el payload. No demuestra quién lo creó, cuándo ocurrió de verdad ni si la afirmación es cierta.",
    },
    en: {
      title: "A stamp is not a signature",
      body: "A reproducible hash detects changes to the payload. It does not prove who created it, when it truly happened, or whether the claim is true.",
    },
  },
  {
    icon: Scale,
    es: {
      title: "La revisión es humana y falible",
      body: "Una atestación registrada puede ser parcial, errónea o controvertida. El comprobante muestra el nivel alcanzado, no un veredicto absoluto.",
    },
    en: {
      title: "Review is human and fallible",
      body: "A recorded attestation can be partial, mistaken, or disputed. The receipt shows the level reached, not an absolute verdict.",
    },
  },
]

export default async function IndependentDeveloperModulePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const es = locale === "es"

  return (
    <TamvAppShell locale={locale}>
      <PageIntro
        number="06.1"
        eyebrow={es ? "MÓDULO DE DESARROLLADOR INDEPENDIENTE" : "INDEPENDENT DEVELOPER MODULE"}
        title={es ? "Evidencia portable," : "Portable evidence,"}
        accent={es ? "sin promesas de pago." : "without payment promises."}
        description={
          es
            ? "Un módulo adicional para quien contribuye por cuenta propia: sella un comprobante de evidencia, compártelo con revisión humana y verifica su integridad sin subir archivos."
            : "An additional module for independent contributors: stamp an evidence receipt, share it for human review, and verify its integrity without uploading files."
        }
        locale={locale}
        actions={<LanguageSwitch pathname="/desarrolladores/independiente" locale={locale} />}
      />

      <section className="section cev-page-section">
        <div className="container">
          <div className="cev-principles">
            {principles.map((principle) => {
              const Icon = principle.icon
              const copy = es ? principle.es : principle.en
              return (
                <article key={copy.title}>
                  <Icon aria-hidden="true" />
                  <h2>{copy.title}</h2>
                  <p>{copy.body}</p>
                </article>
              )
            })}
          </div>

          <div className="cev-callout">
            <div>
              <p className="eyebrow">{es ? "ALCANCE DEL MÓDULO" : "MODULE SCOPE"}</p>
              <h2>{es ? "Sellar, verificar, exportar. Nada más en esta fase." : "Stamp, verify, export. Nothing else in this phase."}</h2>
              <p>
                {es
                  ? "Esta primera rebanada es sin estado: no crea una cuenta, no guarda el comprobante, no recibe archivos y no concede insignias. El registro autenticado, las atestaciones y la vinculación con propuestas llegan en una fase posterior."
                  : "This first slice is stateless: it does not create an account, store the receipt, receive files, or grant badges. Authenticated registration, attestations, and proposal linkage come in a later phase."}
              </p>
            </div>
            <Link className="button button-outline-dark" href={`/desarrolladores?lang=${locale}`}>
              {es ? "Volver a desarrollo" : "Back to developers"} <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section cev-page-section" id="constructor">
        <div className="container">
          <header className="cev-section-head">
            <p className="eyebrow">01 / {es ? "CONSTRUCTOR" : "BUILDER"}</p>
            <h2>{es ? "Sella un comprobante verificable" : "Stamp a verifiable receipt"}</h2>
            <p>
              {es
                ? "Los campos son declaraciones. La única operación criptográfica es SHA-256 sobre el archivo y sobre el JSON canónico. Revisa cada límite antes de compartirlo."
                : "The fields are declarations. The only cryptographic operation is SHA-256 over the file and over the canonical JSON. Read every limit before sharing it."}
            </p>
          </header>
          <ReceiptBuilder locale={locale} />
        </div>
      </section>

      <section className="section cev-page-section" id="verificador">
        <div className="container">
          <header className="cev-section-head">
            <p className="eyebrow">02 / {es ? "VERIFICADOR" : "VERIFIER"}</p>
            <h2>{es ? "Comprueba un comprobante recibido" : "Check a receipt you received"}</h2>
            <p>
              {es
                ? "Pega el JSON o carga el archivo. La verificación ocurre en tu navegador; si adjuntas la evidencia original, también se comparan los bytes."
                : "Paste the JSON or load the file. Verification runs in your browser; if you attach the original evidence, the bytes are compared too."}
            </p>
          </header>
          <ReceiptVerifier locale={locale} />
        </div>
      </section>

      <section className="section cev-page-section" id="niveles">
        <div className="container">
          <header className="cev-section-head">
            <p className="eyebrow">03 / {es ? "NIVELES" : "LEVELS"}</p>
            <h2>{es ? "Cada nivel responde una pregunta distinta" : "Each level answers a different question"}</h2>
            <p>
              {es
                ? "No colapses los niveles: un comprobante íntegro puede seguir siendo falso, y un archivo coincidente puede haber sido copiado de otra persona."
                : "Do not collapse the levels: an intact receipt can still be false, and a matching file can have been copied from someone else."}
            </p>
          </header>
          <ol className="cev-level-table">
            {RECEIPT_LEVELS.map((level, index) => (
              <li key={level.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{es ? level.labelEs : level.labelEn}</strong>
                  <p>{es ? level.descriptionEs : level.descriptionEn}</p>
                </div>
                <code>{level.id}</code>
              </li>
            ))}
          </ol>
          <p className="cev-semantics">{es ? RECEIPT_SEMANTICS_ES : RECEIPT_SEMANTICS}</p>
        </div>
      </section>

      <section className="section cev-page-section" id="api">
        <div className="container">
          <div className="cev-api-grid">
            <div>
              <p className="eyebrow">04 / {es ? "CONTRATO" : "CONTRACT"}</p>
              <h2>{es ? "Verificación sin estado" : "Stateless verification"}</h2>
              <p>
                {es
                  ? "El endpoint recalcula el hash canónico y devuelve solo el resultado y los límites. No guarda el comprobante, no busca las URLs y no recibe la evidencia."
                  : "The endpoint recomputes the canonical hash and returns only the result and its limits. It does not store the receipt, fetch declared URLs, or receive evidence."}
              </p>
              <p>
                <code>{RECEIPT_SCHEMA}</code> · <code>tamv-jcs-1</code> · <code>sha-256</code>
              </p>
              <div className="cev-api-links">
                <Link href={`/fuentes?lang=${locale}`}>
                  {es ? "Registro de procedencia" : "Provenance register"} <ArrowUpRight aria-hidden="true" />
                </Link>
                <Link href={`/excelencia?lang=${locale}`}>
                  {es ? "Trazabilidad editorial" : "Editorial traceability"} <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            <article className="cev-code-panel">
              <div className="cev-code-head">
                <Braces aria-hidden="true" />
                <span>POST /api/v1/evidence/receipts/verify</span>
              </div>
              <pre><code>{`curl -fsS -X POST \\
  https://tamv.online/api/v1/evidence/receipts/verify \\
  -H 'content-type: application/json' \\
  --data-binary @tamv-cev-receipt.json

# 200: shape + integrity
# 422: schema_validation_failed | integrity_mismatch
# 413: payload_too_large (64 KiB)
# 415: unsupported_media_type`}</code></pre>
              <p>
                {es
                  ? "La respuesta incluye un campo semantics que impide leer el resultado como prueba de autoría, veracidad o pago."
                  : "The response includes a semantics field that prevents reading the result as proof of authorship, truth, or payment."}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section cev-page-section" id="origen">
        <div className="container">
          <div className="cev-origin">
            <div>
              <p className="eyebrow">{es ? "ORIGEN Y ATRIBUCIÓN" : "ORIGIN AND ATTRIBUTION"}</p>
              <h2>{es ? "Una evolución, no una copia" : "An evolution, not a copy"}</h2>
              <p>
                {es
                  ? "El método parte de Proof Drop (Brandon Ducar / ZABAL), que popularizó el comprobante portable con SHA-256 local. Este módulo reelabora el concepto con esquema estricto, canonización documentada, cadena de recibos, consentimiento explícito y niveles de verificación separados. No se copió código del proyecto original, que no declara una licencia general de redistribución."
                  : "The method builds on Proof Drop (Brandon Ducar / ZABAL), which popularised the portable receipt with a local SHA-256. This module reworks the concept with a strict schema, documented canonicalization, a receipt chain, explicit consent, and separated verification levels. No code was copied from the original project, which declares no general redistribution licence."}
              </p>
              <p>
                {es
                  ? "La referencia externa se conserva como procedencia intelectual; el comprobante nativo no hereda sus afirmaciones, su evento ni su ruta de pago."
                  : "The external reference is kept as intellectual provenance; the native receipt does not inherit its claims, event, or payment path."}
              </p>
            </div>
            <div className="cev-origin-facts">
              <div><FileCheck2 aria-hidden="true" /><span>{es ? "Sin archivos en servidor" : "No files on the server"}</span></div>
              <div><Fingerprint aria-hidden="true" /><span>{es ? "SHA-256 local" : "Local SHA-256"}</span></div>
              <div><ShieldCheck aria-hidden="true" /><span>{es ? "Límites explícitos" : "Explicit limits"}</span></div>
            </div>
          </div>
          <p className="cev-footnote">
            {es
              ? "Este módulo no concede insignias, no crea membresías, no acredita formación y no promete pago. Cualquier reconocimiento futuro debe derivarse de hechos registrados y revisados, no de la mera existencia de un comprobante."
              : "This module does not grant badges, create memberships, accredit training, or promise payment. Any future recognition must derive from recorded and reviewed facts, not from the mere existence of a receipt."}
          </p>
        </div>
      </section>
    </TamvAppShell>
  )
}
