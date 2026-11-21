import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Governance and policies", description: "Public TAMV policies on participation, review, authorship, privacy, funding, and academic scope." }
    : { title: "Gobernanza y políticas", description: "Políticas públicas de participación, revisión, autoría, privacidad, financiamiento y alcance académico de TAMV." }
}

const policies = [
  { id: "proceso", labelEs: "Proceso editorial", labelEn: "Editorial process", es: "Cada propuesta avanza mediante estados visibles: recibida, triage, revisión, cambios solicitados, aceptada editorialmente, publicada, no aceptada, apelada o retirada. Una aceptación editorial no es revisión por pares, acreditación ni certificación.", en: "Each submission moves through visible states: received, triage, in review, changes requested, editorially accepted, published, not accepted, appealed, or withdrawn. Editorial acceptance is not peer review, accreditation, or certification." },
  { id: "revision", labelEs: "Revisión y conflictos de interés", labelEn: "Review and conflicts of interest", es: "Quien revisa debe declarar conflictos y recusarse cuando corresponda. Las apelaciones por rechazo requieren una revisión diferente a la decisión original. Las capacidades del equipo revisor y el tipo de revisión deben informarse sin exageraciones.", en: "Reviewers must declare conflicts and recuse themselves when appropriate. Appeals of a rejection require a reviewer other than the original decision-maker. Reviewer qualifications and review type must be disclosed without overstating them." },
  { id: "autoria", labelEs: "Autoría, atribución y licencias", labelEn: "Authorship, attribution, and licenses", es: "La persona autora conserva el control de la difusión y declara contribuciones, fuentes y licencia. Los enlaces a referencias se guardan en privado por defecto; TAMV no descarga archivos ni presume permisos cuando una licencia está ausente.", en: "Authors retain control over dissemination and declare contributions, sources, and license. Evidence links are private by default; TAMV does not download files or infer reuse rights when a license is absent." },
  { id: "privacidad", labelEs: "Privacidad y consentimiento", labelEn: "Privacy and consent", es: "Las propuestas y los intereses de colaboración empiezan como privados. Solo el equipo autorizado puede gestionarlos dentro del portal. La publicación del resumen requiere consentimiento explícito; compartir intereses con terceros es opcional. No incluyas datos personales o confidenciales que no quieras enviar al equipo.", en: "Submissions and collaboration interests start private. Only authorized staff may manage them in the portal. Publishing an abstract requires explicit consent; sharing an interest with third parties is optional. Do not submit personal or confidential data you do not want the team to receive." },
  { id: "financiamiento", labelEs: "Financiamiento e introducciones", labelEn: "Funding and introductions", es: "Una solicitud de colaboración puede facilitar una conversación o introducción con posibles aliados. No equivale a inversión, patrocinio, evaluación financiera ni garantía de contacto. Ningún financiador recibe material privado sin autorización expresa de la persona autora.", en: "A collaboration request may help start a conversation or introduction to potential partners. It is not investment, sponsorship, financial assessment, or a guaranteed connection. No funder receives private material without the author’s express consent." },
  { id: "academia", labelEs: "Educación y reconocimiento oficial", labelEn: "Education and official recognition", es: "La plataforma puede alojar propuestas didácticas y tesis, pero no declara RVOE, acreditación, equivalencia de estudios ni emisión de títulos oficiales. Cualquier validez depende de una autorización vigente, específica y verificable.", en: "The platform may host learning proposals and theses, but makes no claim of RVOE, accreditation, degree equivalency, or official credential issuance. Validity depends on a current, specific, verifiable authorization." },
  { id: "transparencia", labelEs: "Trazabilidad y límites", labelEn: "Traceability and limits", es: "Los registros de eventos usan hashes SHA-256 encadenados para detectar modificaciones locales en una secuencia. Sin una firma ni ancla externa, no prueban inmutabilidad ni autoría independiente. La verificación técnica y la seguridad siguen pendientes de revisión externa.", en: "Event records use chained SHA-256 hashes to help detect local changes in a sequence. Without a signature or external anchor, they do not prove immutability or independent authorship. Technical verification and security remain subject to external review." },
]

export default async function GovernancePage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="04" eyebrow={english ? "GOVERNANCE & PARTICIPATION" : "GOBERNANZA Y PARTICIPACIÓN"} title={english ? "Trust needs" : "La confianza requiere"} accent={english ? "visible rules." : "reglas visibles."} description={english ? "Policies distinguish editorial decisions, privacy, consent, external review, academic recognition, and funding introductions." : "Las políticas separan decisiones editoriales, privacidad, consentimiento, revisión externa, reconocimiento académico e introducciones de financiamiento."} locale={locale} actions={<LanguageSwitch pathname="/gobernanza" locale={locale} />} />
    <section className="section governance-page-section"><div className="container policy-layout">
      <nav className="policy-index" aria-label={english ? "Policy index" : "Índice de políticas"}><p className="eyebrow">{english ? "INDEX" : "ÍNDICE"}</p>{policies.map((policy) => <a href={`#${policy.id}`} key={policy.id}>{english ? policy.labelEn : policy.labelEs}</a>)}</nav>
      <div className="policy-content">{policies.map((policy, index) => <article className="policy-article" id={policy.id} key={policy.id}><p className="eyebrow">{String(index + 1).padStart(2, "0")} / {english ? "POLICY" : "POLÍTICA"}</p><h2>{english ? policy.labelEn : policy.labelEs}</h2><p>{english ? policy.en : policy.es}</p></article>)}
        <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p>{english ? "These pages describe platform rules, not legal advice or proof of compliance. Policies and local obligations must be reviewed by responsible humans before operation." : "Estas páginas describen reglas de la plataforma; no son asesoría legal ni prueba de cumplimiento. Las políticas y obligaciones locales requieren revisión humana antes de operar."}</p></div>
        <div className="policy-cta"><div><h3>{english ? "Need a correction or appeal?" : "¿Necesitas corregir o apelar?"}</h3><p>{english ? "Use the private submission portal to follow your record and present an appeal." : "Usa el portal privado para seguir tu registro y presentar una apelación."}</p></div><Link className="text-link" href="/portal">{english ? "Open the portal" : "Abrir el portal"} <ArrowUpRight aria-hidden="true" /></Link></div>
      </div>
    </div></section>
  </TamvAppShell>
}
