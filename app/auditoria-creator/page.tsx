import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, ShieldAlert } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { AuditSheetGenerator } from "@/components/audit/audit-sheet-generator"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Audit · TAMV Creator Intelligence — one-page audit record", description: "The one-page Creator Intelligence audit record: clean summary for auditors and regulators above, cryptographic detail for engineers below. Live SHA-512 digest and ephemeral demonstration Ed25519 signature, computed in the browser." }
    : { title: "Auditoría · TAMV Creator Intelligence — ficha de una página", description: "La ficha de auditoría de una página de Creator Intelligence: resumen limpio para auditores y reguladores arriba, detalle criptográfico para ingenieros abajo. Digest SHA-512 en vivo y firma Ed25519 efímera de demostración, calculados en el navegador." }
}

export default async function AuditCreatorPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="09" eyebrow={english ? "AUDIT · TAMV CREATOR INTELLIGENCE" : "AUDITORÍA · TAMV CREATOR INTELLIGENCE"} title={english ? "The record an auditor" : "La ficha que un auditor"} accent={english ? "can receive." : "puede recibir."} description={english ? "The one-page Creator Intelligence audit record, published here first, in the TAMV hub: above, the clean summary for auditors and regulators — which AI step ran, under which policy, who approved it, and what was decided — and below, the cryptographic detail for engineers. It answers directly what compliance officers ask for: proof of what ran and who approved it." : "El registro de auditoría de una página de Creator Intelligence, publicado primero aquí, en el hub TAMV: arriba el resumen limpio para auditores y reguladores — qué paso de IA corrió, bajo qué política, quién lo aprobó y qué se decidió — y abajo el detalle criptográfico para ingenieros. Es la respuesta directa a lo que piden los oficiales de cumplimiento: probar qué corrió y quién lo aprobó."} locale={locale} actions={<LanguageSwitch pathname="/auditoria-creator" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="doc-status-row" role="status">
        <span>{english ? "Summary first · Auditors and regulators" : "Resumen primero · Auditores y reguladores"}</span>
        <span>{english ? "Detail after · SHA-512 · Ed25519 · Traces" : "Detalle después · SHA-512 · Ed25519 · Trazas"}</span>
        <span>{english ? "One-page format · Printable" : "Formato de una página · Imprimible"}</span>
      </div>

      <div className="doc-warning" role="alert">
        <ShieldAlert aria-hidden="true" />
        <strong>{english ? "WARNING — THESE ARE FORMAT EXAMPLES, NOT REAL RUNTIME RECORDS" : "ADVERTENCIA — SON EJEMPLOS DE FORMATO, NO REGISTROS REALES DEL RUNTIME"}</strong>
        <p>{english ? "The records on this page are format examples generated here. They are not real Creator Intelligence runtime records: their folio, trace, and signature do not come from the runtime." : "Los registros de esta página son ejemplos de formato generados aquí. No son registros reales del runtime de Creator Intelligence: su folio, su traza y su firma no provienen del runtime."}</p>
        <p>{english ? "The production signing key does not live on this public page. The demonstration Ed25519 signature uses an ephemeral key created in your session only to show verification." : "La clave de firma de producción no vive en esta página pública. La firma Ed25519 de la demostración usa una clave efímera creada en tu sesión únicamente para mostrar la verificación."}</p>
        <p>{english ? "A hash does not prove immutability or authorship without a signature and an external anchor. The SHA-512 digest is computed in your browser, right now, over the record's canonical content; the Ed25519 signature is verified in this page. When the system issues a real record, its folio, trace, and signature come from the Creator Intelligence runtime, and this same one-page record is the document the auditor receives." : "Un hash no prueba inmutabilidad ni autoría sin firma ni ancla externa. El digest SHA-512 se calcula en tu navegador, en este momento, sobre el contenido canónico de la ficha; la firma Ed25519 de la demostración se verifica en esta página. Cuando el sistema emite un registro real, su folio, su traza y su firma vienen del runtime de Creator Intelligence, y esta misma ficha, en una página, es el documento que recibe el auditor."}</p>
      </div>

      <AuditSheetGenerator locale={locale} />

      <h2>{english ? "The 4 public v3 skills." : "Las 4 habilidades públicas v3."}</h2>
      <p>{english ? "According to the sheet “Habilidades Públicas de TAMV Creator Intelligence” (modified 15 Nov 2026), Creator Intelligence publishes 4 public v3 skills over 37 declared internal contracts. All 4 carry the same status: published contract, in development, no certified release." : "Según la hoja «Habilidades Públicas de TAMV Creator Intelligence» (mod. 15 nov 2026), Creator Intelligence publica 4 habilidades v3 sobre 37 contratos internos declarados. Las 4 tienen el mismo estado: contrato publicado, en desarrollo, no release certificado."}</p>
      <ul>
        <li><strong>tamv-creator-os</strong> — {english ? "Creator: identity, strategy, content, launches, community, education and support." : "Creador: identidad, estrategia, contenido, lanzamientos, comunidad, educación y soporte."} <strong>{english ? "Status: " : "Estado: "}</strong>{english ? "Published contract, in development, no certified release / UNSIGNED_RELEASE_PENDING." : "Contrato publicado, en desarrollo, no release certificado / UNSIGNED_RELEASE_PENDING."}</li>
        <li><strong>tamv-audio-intelligence</strong> — {english ? "Audio: music, local signature voice, DSP, video, visuals, mixing and mastering." : "Audio: música, voz característica local, DSP, video, visuales, mezcla y masterización."} <strong>{english ? "Status: " : "Estado: "}</strong>{english ? "Published contract, in development, no certified release / UNSIGNED_RELEASE_PENDING." : "Contrato publicado, en desarrollo, no release certificado / UNSIGNED_RELEASE_PENDING."}</li>
        <li><strong>tamv-growth-engine</strong> — {english ? "Growth: SEO, AI SEO, content, conversion, ethical monetization, email and analytics." : "Crecimiento: SEO, AI SEO, contenido, conversión, monetización ética, email y analítica."} <strong>{english ? "Status: " : "Estado: "}</strong>{english ? "Published contract, in development, no certified release / UNSIGNED_RELEASE_PENDING." : "Contrato publicado, en desarrollo, no release certificado / UNSIGNED_RELEASE_PENDING."}</li>
        <li><strong>tamv-sovereign-platform</strong> — {english ? "Platform: governance, security, integrity, SLSA, data, Skills Bridge and operation on Vercel." : "Plataforma: gobernanza, seguridad, integridad, SLSA, datos, Skills Bridge y operación en Vercel."} <strong>{english ? "Status: " : "Estado: "}</strong>{english ? "Published contract, in development, no certified release / UNSIGNED_RELEASE_PENDING." : "Contrato publicado, en desarrollo, no release certificado / UNSIGNED_RELEASE_PENDING."}</li>
      </ul>
      <div className="doc-note">
        <strong>{english ? "Source and scope." : "Fuente y alcance."}</strong>
        <span> {english ? "Source cited by the sheet: GitHub AnubisVillasenor1/tamv-creator-intelligence — Creator OS and governed skills package of TAMV ONLINE NETWORK (PLAY & GO), with creative review under human supervision, NIST CSF 2.0 policies in HyperCore, a TAMV Genesis evidence kernel and a fail-closed cryptographic seal (SHA-256 + Ed25519). “The AI proposes; the human decides.” No release is presented here as certified: the 4 skills are UNSIGNED_RELEASE_PENDING, and the 37 internal contracts are a statement from the sheet, not an independent verification." : "Fuente citada por la hoja: GitHub AnubisVillasenor1/tamv-creator-intelligence — Creator OS y paquete de skills gobernadas de TAMV ONLINE NETWORK (PLAY & GO), con revisión creativa con supervisión humana, políticas NIST CSF 2.0 en HyperCore, kernel de evidencia TAMV Genesis y sello criptográfico fail-closed (SHA-256 + Ed25519). «La IA propone; el humano decide». Ningún release se presenta aquí como certificado: las 4 skills son UNSIGNED_RELEASE_PENDING, y los 37 contratos internos son una declaración de la hoja, no una verificación independiente."}</span>
      </div>

      <div className="doc-note">
        <strong>{english ? "What this record is and is not." : "Qué es y qué no es esta ficha."}</strong>
        <span> {english ? "It is the official format of the Creator Intelligence audit record, shown with example records generated on this page. The template example from the hub is BPI-2026-0001, “Restauración y aislamiento del runtime federado de Isabella AI”, dated 2026-10-08 — a BookPI decision template, not an audit record." : "Es el formato oficial del registro de auditoría de Creator Intelligence, mostrado con registros de ejemplo generados en esta página. La plantilla de ejemplo del hub es BPI-2026-0001, «Restauración y aislamiento del runtime federado de Isabella AI», fecha 2026-10-08 — una plantilla de decisión BookPI, no un registro de auditoría."}</span>
      </div>
      <p><Link className="text-link" href={`/desarrolladores?lang=${locale}`}>{english ? "Back to developer interfaces" : "Volver a interfaces para desarrollo"} <ArrowUpRight aria-hidden="true" /></Link></p>
    </div></section>
  <TamvSectionMedia area="audit" locale={locale} />
      </TamvAppShell>
}
