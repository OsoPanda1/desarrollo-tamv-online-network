import type { Metadata } from "next"
import { Fragment } from "react"
import Link from "next/link"
import { ArrowUpRight, ShieldAlert } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"
import { TamvSectionMedia } from "@/components/tamv-section-media"
import { LanguageSwitch } from "@/components/shared/language-switch"
import { PageIntro } from "@/components/shared/page-intro"
import { resolveLocale } from "@/lib/i18n"

type SearchParams = Promise<{ lang?: string }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const english = resolveLocale((await searchParams).lang) === "en"
  return english
    ? { title: "Isabella AI / TINA — governed federated intelligence", description: "Isabella AI Genesis v4.3.3 (cut-off 2026-09-26): FGAIS pipeline, pentagonal network, dual-layer Policy Gate, decision ledger, TINA, CROWN as PDP, BookPI, and Hyper Core Turbo Ω-X3 objectives. Prototype, not certified for production." }
    : { title: "Isabella AI / TINA — inteligencia federada gobernada", description: "Isabella AI Genesis v4.3.3 (corte 2026-09-26): pipeline FGAIS, red pentagonal, Policy Gate de doble capa, ledger de decisiones, TINA, CROWN como PDP, BookPI y objetivos de Hyper Core Turbo Ω-X3. Prototipo, no certificado para producción." }
}

type Pair = { es: string; en: string }
const t = (english: boolean, pair: Pair) => (english ? pair.en : pair.es)

const sections: { id: string; num: string; title: Pair }[] = [
  { id: "s0", num: "§0", title: { es: "Ficha: Isabella AI Genesis v4.3.3 — madurez honesta", en: "Record: Isabella AI Genesis v4.3.3 — honest maturity" } },
  { id: "s1", num: "§1", title: { es: "Sistema FGAIS: pipeline, red pentagonal, Policy Gate, ledger y memoria", en: "FGAIS system: pipeline, pentagonal network, Policy Gate, ledger, and memory" } },
  { id: "s2", num: "§2", title: { es: "TINA: Trusted Intelligence, Native & Adaptive", en: "TINA: Trusted Intelligence, Native & Adaptive" } },
  { id: "s3", num: "§3", title: { es: "C.R.O.W.N. como Policy Decision Point", en: "C.R.O.W.N. as Policy Decision Point" } },
  { id: "s4", num: "§4", title: { es: "BookPI: ledger de evidencia", en: "BookPI: evidence ledger" } },
  { id: "s5", num: "§5", title: { es: "Hyper Core Turbo Ω-X3: objetivos a validar", en: "Hyper Core Turbo Ω-X3: objectives to validate" } },
  { id: "s6", num: "§6", title: { es: "Qué Isabella no es: des-antropomorfización y límites del corpus", en: "What Isabella is not: de-anthropomorphisation and corpus limits" } },
]

const maturity: { metric: Pair; value: string; source: Pair }[] = [
  { metric: { es: "Avance global", en: "Overall progress" }, value: "54%", source: { es: "Genesis D2, §5.1: (46,2% + 62%) / 2 ≈ 54%", en: "Genesis D2, §5.1: (46.2% + 62%) / 2 ≈ 54%" } },
  { metric: { es: "Implementación ponderada", en: "Weighted implementation" }, value: "46,2% (cota inferior)", source: { es: "Genesis D2, §5.1: (44×1,0 + 374×0,5) / 500; FIXED=1,0; PARTIAL=0,5", en: "Genesis D2, §5.1: (44×1.0 + 374×0.5) / 500; FIXED=1.0; PARTIAL=0.5" } },
  { metric: { es: "Preparación de despliegue", en: "Deployment readiness" }, value: "62%", source: { es: "Genesis D2, §5.1", en: "Genesis D2, §5.1" } },
  { metric: { es: "P0 FIXED (correcto)", en: "P0 FIXED (correct)" }, value: "35/134 = 26,1%", source: { es: "Genesis D2, §5.1; avance ponderado P0: 47,0%", en: "Genesis D2, §5.1; weighted P0 progress: 47.0%" } },
  { metric: { es: "Seguro para producción", en: "Production safe" }, value: "production_safe: false", source: { es: "Genesis D1/D2, §5.3", en: "Genesis D1/D2, §5.3" } },
  { metric: { es: "Estado declarado", en: "Declared state" }, value: "«Prototipo / Arquitectura ejecutable en evolución» · «No certificada para producción»", source: { es: "Caso de estudio TINA, §§1, 6; Genesis v4.3.3, §5", en: "TINA case study, §§1, 6; Genesis v4.3.3, §5" } },
]

const isa500: { state: string; items: string; share: string }[] = [
  { state: "FIXED", items: "44", share: "8,8%" },
  { state: "PARTIAL", items: "374", share: "74,8%" },
  { state: "STILL_BROKEN", items: "72", share: "14,4%" },
  { state: "BLOCKED_ENVIRONMENT", items: "8", share: "1,6%" },
]

const blockers: { code: string; blocker: Pair; source: Pair }[] = [
  { code: "B1", blocker: { es: "CI de GitHub Actions suspendida por problema de facturación en la cuenta administradora (issue #66).", en: "GitHub Actions CI suspended over a billing problem on the administrator account (issue #66)." }, source: { es: "Genesis D1/D2, §5.3", en: "Genesis D1/D2, §5.3" } },
  { code: "B2", blocker: { es: "GHCR: acceso DENIED al publicar o inspeccionar imágenes.", en: "GHCR: DENIED access when publishing or inspecting images." }, source: { es: "Genesis D1/D2, §5.3", en: "Genesis D1/D2, §5.3" } },
  { code: "B3", blocker: { es: "Migración en vivo 20260926030000 (define isabella_policies e isabella_decisions) pendiente de aplicar en producción; por ello las capacidades de Policy-as-Code se publican como production_safe: false.", en: "Live migration 20260926030000 (defines isabella_policies and isabella_decisions) pending in production; hence Policy-as-Code capabilities are published as production_safe: false." }, source: { es: "Genesis D1/D2, §5.3", en: "Genesis D1/D2, §5.3" } },
]

const fgais: { n: string; stage: string; detail: Pair }[] = [
  { n: "1", stage: "PERCEIVE", detail: { es: "Sanitización + Prompt Guard multi-capa, 9 categorías de amenaza (jailbreaks, inyecciones, exfiltración), regex ponderadas, riesgo de none a critical.", en: "Sanitisation + multi-layer Prompt Guard, 9 threat categories (jailbreaks, injections, exfiltration), weighted regexes, risk from none to critical." } },
  { n: "2", stage: "REMEMBER", detail: { es: "Recuperación vectorial en memoria jerárquica (véase §1.4).", en: "Vector retrieval over hierarchical memory (see §1.4)." } },
  { n: "3", stage: "POLICY GATE", detail: { es: "Check fail-closed: si falla, la ejecución se interrumpe antes de consumir inferencia.", en: "Fail-closed check: on failure, execution stops before any inference is consumed." } },
  { n: "4", stage: "DECIDE", detail: { es: "Structured Reasoning Engine + Intention Parser; 8 dominios canónicos (submission, library, constitution, governance, ecosystem, education, skills, ethics), 14 patrones regex con confianza ponderada, trace_id auditable.", en: "Structured Reasoning Engine + Intention Parser; 8 canonical domains (submission, library, constitution, governance, ecosystem, education, skills, ethics), 14 regex patterns with weighted confidence, auditable trace_id." } },
  { n: "5", stage: "ACT", detail: { es: "Despacho de tools en sandbox con reevaluación JIT de permisos.", en: "Tool dispatch in a sandbox with just-in-time permission re-evaluation." } },
  { n: "6", stage: "AUDIT", detail: { es: "Registro con SHA3-512 y firma post-cuántica (véase §1.3).", en: "Record with SHA3-512 and post-quantum signature (see §1.3)." } },
  { n: "7", stage: "RESPOND", detail: { es: "Verificación de firma y emisión por /api/isabella/chat.", en: "Signature verification and issuance via /api/isabella/chat." } },
]

const pentagonal: { node: string; role: Pair; source: string }[] = [
  { node: "CROWN", role: { es: "Arbitraje y estado global; Constitución C.R.O.W.N., Manifiesto RFC-0001; autoridad superior del runtime YUN.", en: "Arbitration and global state; C.R.O.W.N. Constitution, Manifesto RFC-0001; highest authority of the YUN runtime." }, source: "Genesis D1, §2.2" },
  { node: "ISA", role: { es: "Identidad, tono e interfaz; Intention Parser, 8 dominios.", en: "Identity, tone, and interface; Intention Parser, 8 domains." }, source: "Genesis D1, §2.2" },
  { node: "SOPHIA", role: { es: "Verificación de evidencia; escala de certeza E0–E4; impide alucinaciones.", en: "Evidence verification; certainty scale E0–E4; prevents hallucinations." }, source: "Genesis D1, §2.2" },
  { node: "ORION", role: { es: "Aislamiento, sandbox, ejecución de skills.", en: "Isolation, sandbox, skill execution." }, source: "Genesis D1, §2.2" },
  { node: "ARGUS", role: { es: "Defensa activa, telemetría Anubis Sentinel, Prompt Guard, veto estricto.", en: "Active defence, Anubis Sentinel telemetry, Prompt Guard, strict veto." }, source: "Genesis D1, §2.2" },
]

const memoryLevels: { level: string; detail: Pair }[] = [
  { level: "immediate", detail: { es: "Volátil.", en: "Volatile." } },
  { level: "session", detail: { es: "Dura la sesión.", en: "Lasts the session." } },
  { level: "project", detail: { es: "Malla delimitada.", en: "Bounded mesh." } },
  { level: "territorial", detail: { es: "Duradera, restringida por soberanía regulatoria.", en: "Durable, restricted by regulatory sovereignty." } },
  { level: "historical", detail: { es: "Largo plazo, con procedencia e inmutabilidad.", en: "Long term, with provenance and immutability." } },
]

const tinaCycle: { n: string; stage: Pair; detail: Pair }[] = [
  { n: "1", stage: { es: "IDENTITY / TENANT (ISA)", en: "IDENTITY / TENANT (ISA)" }, detail: { es: "Identidad y tenant antes de cualquier otra etapa.", en: "Identity and tenant before any other stage." } },
  { n: "2", stage: { es: "INPUT SECURITY", en: "INPUT SECURITY" }, detail: { es: "sanitizePayload.", en: "sanitizePayload." } },
  { n: "3", stage: { es: "MEMORY / EVIDENCE", en: "MEMORY / EVIDENCE" }, detail: { es: "Memoria y evidencia previas a la decisión.", en: "Memory and evidence before the decision." } },
  { n: "4", stage: { es: "CROWN POLICY (PDP)", en: "CROWN POLICY (PDP)" }, detail: { es: "Riesgo alto → Human Review Gate.", en: "High risk → Human Review Gate." } },
  { n: "5", stage: { es: "INTELLIGENCE GOVERNANCE", en: "INTELLIGENCE GOVERNANCE" }, detail: { es: "MoE routing.", en: "MoE routing." } },
  { n: "6", stage: { es: "AUTHORIZED CAPABILITY (PEP)", en: "AUTHORIZED CAPABILITY (PEP)" }, detail: { es: "Execution Token Grant.", en: "Execution Token Grant." } },
  { n: "7", stage: { es: "EXECUTION (ORION vía Zod)", en: "EXECUTION (ORION via Zod)" }, detail: { es: "Ejecución validada por esquema.", en: "Schema-validated execution." } },
  { n: "8", stage: { es: "OUTPUT GATE", en: "OUTPUT GATE" }, detail: { es: "Gate de salida antes de responder.", en: "Output gate before responding." } },
  { n: "9", stage: { es: "AUDIT / LEDGER → RESPONSE", en: "AUDIT / LEDGER → RESPONSE" }, detail: { es: "Hashes ANUBIS / BookPI / Decision Ledger; después, respuesta.", en: "ANUBIS / BookPI / Decision Ledger hashes; then, response." } },
]

const subsystems: string[] = [
  "CROWN", "AEGIS/ARGUS", "ISA", "SOPHIA", "ORION", "MNEMOS", "LUMEN", "HERMES", "ATLAS", "ANUBIS",
  "BookPI", "Dual Kernel", "Intelligence Router", "Learning Plane", "Output Gate", "Kill Switch",
  "SecuritySystem", "Territory Context", "Decision Ledger", "Observability",
]

const verificationStates: { state: string; note: Pair }[] = [
  { state: "IMPLEMENTED", note: { es: "Implementado.", en: "Implemented." } },
  { state: "TESTED", note: { es: "Probado.", en: "Tested." } },
  { state: "VERIFIED", note: { es: "Verificado.", en: "Verified." } },
  { state: "EVIDENCE_GATED", note: { es: "Bloqueo activo, no aprobación: EVIDENCE_GATED ≠ PASS.", en: "Active block, not approval: EVIDENCE_GATED ≠ PASS." } },
  { state: "BLOCKED", note: { es: "Bloqueado.", en: "Blocked." } },
  { state: "BLOCKED_ENVIRONMENT", note: { es: "Bloqueado por entorno.", en: "Blocked by environment." } },
  { state: "DEGRADED", note: { es: "Degradado: respuesta determinista local ante fallo de LLM externo; prohibido simular equivalencia con modelos remotos.", en: "Degraded: deterministic local response on external LLM failure; simulating equivalence with remote models is forbidden." } },
]

const techDebt: { area: Pair }[] = [
  { area: { es: "RLS real bajo carga", en: "Real RLS under load" } },
  { area: { es: "Migraciones Prisma", en: "Prisma migrations" } },
  { area: { es: "Backup / restore", en: "Backup / restore" } },
  { area: { es: "CI completa", en: "Full CI" } },
  { area: { es: "CodeQL", en: "CodeQL" } },
  { area: { es: "Observabilidad y autorrecuperación", en: "Observability and self-recovery" } },
  { area: { es: "Rollback", en: "Rollback" } },
  { area: { es: "Pruebas de proveedores", en: "Provider tests" } },
  { area: { es: "KMS / HSM", en: "KMS / HSM" } },
  { area: { es: "Aislamiento cross-tenant", en: "Cross-tenant isolation" } },
  { area: { es: "Rendimiento bajo carga", en: "Performance under load" } },
]

const hyperCore: { mechanism: Pair; range: string }[] = [
  { mechanism: { es: "Semantic Cache (≥0.94)", en: "Semantic Cache (≥0.94)" }, range: "−20% … −60% {calls}" },
  { mechanism: { es: "Speculative Execution", en: "Speculative Execution" }, range: "−15% … −40% {wait}" },
  { mechanism: { es: "Parallel Agent Mesh", en: "Parallel Agent Mesh" }, range: "2×–5×" },
  { mechanism: { es: "Model Router", en: "Model Router" }, range: "−30% … −70% {costs}" },
  { mechanism: { es: "KV Cache", en: "KV Cache" }, range: "−20% … −50% {tokens}" },
  { mechanism: { es: "TensorRT / ONNX / CUDA + INT8 / FP16", en: "TensorRT / ONNX / CUDA + INT8 / FP16" }, range: "1.3×–2.5×" },
]

const latencyBudget: { stage: Pair; from: string; to: string }[] = [
  { stage: { es: "CROWN", en: "CROWN" }, from: "25 ms", to: "8 ms" },
  { stage: { es: "Memoria semántica", en: "Semantic memory" }, from: "120 ms", to: "25 ms" },
  { stage: { es: "Planificación", en: "Planning" }, from: "250 ms", to: "80 ms" },
  { stage: { es: "Inferencia", en: "Inference" }, from: "400 ms", to: "150 ms" },
  { stage: { es: "Herramientas / sandbox", en: "Tools / sandbox" }, from: "80 ms", to: "30 ms" },
  { stage: { es: "Verificación / sellado BookPI", en: "BookPI verification / sealing" }, from: "25 ms", to: "7 ms" },
]

export default async function IsabellaPage({ searchParams }: { searchParams: SearchParams }) {
  const locale = resolveLocale((await searchParams).lang)
  const english = locale === "en"
  return <TamvAppShell locale={locale}>
    <PageIntro number="10" eyebrow={english ? "ISABELLA AI / TINA / ISABELLA CERO" : "ISABELLA AI / TINA / ISABELLA CERO"} title={english ? "Governed intelligence," : "Inteligencia gobernada,"} accent={english ? "with the evidence first." : "con la evidencia primero."} description={english ? "Isabella Villaseñor AI is a federated governed AI system (FGAIS): a prototype in evolution, not certified for production. This page ports the Genesis v4.3.3 reports (cut-off 2026-09-26) and the TINA case study as documented, with their figures, blockers, and contradictions intact." : "Isabella Villaseñor AI es un sistema federado de inteligencia artificial gobernada (FGAIS): un prototipo en evolución, no certificado para producción. Esta página porta los informes Genesis v4.3.3 (corte 2026-09-26) y el caso de estudio TINA tal como están documentados, con sus cifras, bloqueos y contradicciones intactos."} locale={locale} actions={<LanguageSwitch pathname="/isabella" locale={locale} />} />

    <section className="section"><div className="container">
      <div className="doc-status-row" role="status">
        <span><strong>{english ? "Version" : "Versión"}:</strong> Genesis v4.3.3</span>
        <span><strong>{english ? "Cut-off" : "Corte"}:</strong> 2026-09-26</span>
        <span><strong>{english ? "Overall progress" : "Avance global"}:</strong> 54%</span>
        <span><strong>{english ? "Weighted implementation" : "Implementación ponderada"}:</strong> 46,2%</span>
        <span><strong>{english ? "Deployment readiness" : "Preparación de despliegue"}:</strong> 62%</span>
        <span><strong>production_safe:</strong> false</span>
        <span><strong>{english ? "State" : "Estado"}:</strong> {english ? "Prototype / executable architecture in evolution" : "Prototipo / Arquitectura ejecutable en evolución"}</span>
        <span><strong>{english ? "Node" : "Nodo"}:</strong> {english ? "Node Zero, Real del Monte, Hidalgo, Mexico" : "Nodo Cero, Real del Monte, Hidalgo, México"}</span>
      </div>

      <div className="doc-warning" role="note">
        <ShieldAlert aria-hidden="true" />
        <strong>{english ? "NOT CERTIFIED FOR PRODUCTION — READ FIRST" : "NO CERTIFICADA PARA PRODUCCIÓN — LÉASE PRIMERO"}</strong>
        <p>{english ? "Isabella is a prototype, not certified for production. No figure on this page is a production claim, a certification, or an independent external audit: every number is transcribed from the Genesis v4.3.3 reports and the TINA case study, with the discrepancies between those documents noted where they occur." : "Isabella es un prototipo, no certificado para producción. Ninguna cifra de esta página es una afirmación de producción, una certificación ni una auditoría externa independiente: cada número se transcribe de los informes Genesis v4.3.3 y del caso de estudio TINA, con las discrepancias entre esos documentos anotadas donde ocurren."}</p>
      </div>

      <nav aria-label={english ? "Document index" : "Índice del documento"}>
        <ul className="doc-index">
          {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.num} · {t(english, s.title)}</a></li>)}
        </ul>
      </nav>
    </div></section>

    <section className="section"><div className="container">

      <details className="doc-details" id="s0" open>
        <summary>{sections[0].num} · {t(english, sections[0].title)}</summary>
        <p>{english ? "Isabella Villaseñor AI is described in the Genesis v4.3.3 reports as a Federated Governed AI System (FGAIS) that orchestrates cognitive capabilities, identity, security, forensic audit, and state persistence under “strict, deterministic, and verifiable” governance. The two Genesis reports describe the same system at different levels of detail; D2 (“Isabella AI Genesis: Documento de Presentación Global”, with formulas) is the preferred source for figures, and D1 (“INFORME GLOBAL DE PRESENTACIÓN TÉCNICA Y DE GOBERNANZA: ISABELLA AI GENESIS (v4.3.3)”) adds data D2 does not carry. Note that the two reports carry each other's title as their internal heading (analysis §6.1, point 15)." : "Isabella Villaseñor AI se describe en los informes Genesis v4.3.3 como un sistema federado de inteligencia artificial gobernada (FGAIS) que orquesta capacidades cognitivas, identidad, seguridad, auditoría forense y persistencia de estado bajo gobernanza «estricta, determinista y verificable». Los dos informes Genesis describen el mismo sistema con distinto nivel de detalle; D2 («Isabella AI Genesis: Documento de Presentación Global», con fórmulas) es la fuente preferente para las cifras, y D1 («INFORME GLOBAL DE PRESENTACIÓN TÉCNICA Y DE GOBERNANZA: ISABELLA AI GENESIS (v4.3.3)») aporta datos que D2 no contiene. Nótese que los dos informes llevan cruzados el título registrado y su encabezado interno (análisis §6.1, punto 15)."}</p>
        <h3>{english ? "0.1 · Maturity (Genesis v4.3.3, cut-off 2026-09-26)" : "0.1 · Madurez (Genesis v4.3.3, corte 2026-09-26)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Metric" : "Métrica"}</th><th>{english ? "Value" : "Valor"}</th><th>{english ? "Source" : "Fuente"}</th></tr></thead>
          <tbody>{maturity.map((m) => <tr key={m.metric.es}><td>{t(english, m.metric)}</td><td>{m.value}</td><td>{t(english, m.source)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "0.2 · ISA-500 audit: 500 items declared, 498 counted" : "0.2 · Auditoría ISA-500: 500 ítems declarados, 498 contados"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "State" : "Estado"}</th><th>{english ? "Items" : "Ítems"}</th><th>{english ? "Share" : "Porcentaje"}</th></tr></thead>
          <tbody>{isa500.map((r) => <tr key={r.state}><td>{r.state}</td><td>{r.items}</td><td>{r.share}</td></tr>)}</tbody>
        </table></div>
        <p>{english ? "Arithmetic discrepancy, recorded in both reports: the table adds up to 498 items, not 500, and the percentages add up to 99.6%. Two items are missing without explanation (analysis §3.7). The weighted-implementation formula is a lower bound: the commitments of 2026-09-26 have not been re-counted across the 500 cells, so the official figures remain fixed at 54% without inflating progress (Genesis D2, §5.1)." : "Discrepancia aritmética, registrada en ambos informes: la tabla suma 498 ítems, no 500, y los porcentajes suman 99,6%. Faltan 2 ítems sin explicar (análisis §3.7). La fórmula de implementación ponderada es una cota inferior: los compromisos del 2026-09-26 no se han re-contado en las 500 casillas, por lo que las cifras oficiales permanecen fijadas en 54% sin inflar el progreso (Genesis D2, §5.1)."}</p>
        <div className="doc-warning" role="note">
          <strong>{english ? "D1 / D2 contradiction on P0 FIXED" : "Contradicción D1 / D2 sobre P0 FIXED"}</strong>
          <p>{english ? "D1 states that P0 FIXED items are 44 and that this is 26.1% nominal “(44/134)”. But 44/134 = 32.8%; 26.1% corresponds to 35/134, which is D2's figure. One of the two numbers is wrong; D1 appears to confuse the total FIXED count (44) with the P0 subset. This page uses D2: 35/134 = 26.1% (analysis §3.7)." : "D1 afirma que los P0 FIXED son 44 y que eso es el 26,1% nominal «(44/134)». Pero 44/134 = 32,8%; el 26,1% corresponde a 35/134, que es la cifra de D2. Uno de los dos números está mal; D1 parece confundir el total FIXED (44) con el subconjunto P0. Esta página usa D2: 35/134 = 26,1% (análisis §3.7)."}</p>
        </div>
        <h3>{english ? "0.3 · Local quality gates: PASS" : "0.3 · Quality gates locales: PASS"}</h3>
        <p>{english ? "pnpm typecheck PASS (0 errors); pnpm lint PASS (0 errors, 33 accepted warnings); pnpm test PASS (720 tests passed, 13 skipped, 0 failures; 117 of 119 files passed); pnpm build PASS; pnpm security:scan PASS; pnpm capabilities PASS (31 capabilities: 28 real operational, 2 evidence-gated, 1 manual); pnpm db:verify PASS (36 migrations); pnpm production:preflight PASS (30 critical files). Source: Genesis D2, §5.2. The capability doctrine applies: existing code ≠ verified capability — only what is proven end-to-end with executable evidence counts; a green build ≠ system certification; EVIDENCE_GATED ≠ PASS; a simulated signature ≠ operational cryptography (Genesis D1/D2, §1.2)." : "pnpm typecheck PASS (0 errores); pnpm lint PASS (0 errores, 33 advertencias aceptadas); pnpm test PASS (720 pruebas aprobadas, 13 omitidas, 0 fallos; 117 archivos aprobados de 119); pnpm build PASS; pnpm security:scan PASS; pnpm capabilities PASS (31 capacidades: 28 reales operativas, 2 evidence-gated, 1 manual); pnpm db:verify PASS (36 migraciones); pnpm production:preflight PASS (30 archivos críticos). Fuente: Genesis D2, §5.2. Aplica la doctrina de capacidad: código existente ≠ capacidad verificada — solo cuenta lo probado end-to-end con evidencias ejecutables; build verde ≠ certificación de sistema; EVIDENCE_GATED ≠ PASS; firma simulada ≠ criptografía operativa (Genesis D1/D2, §1.2)."}</p>
        <h3>{english ? "0.4 · Critical blockers" : "0.4 · Bloqueos críticos"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Code" : "Código"}</th><th>{english ? "Blocker" : "Bloqueo"}</th><th>{english ? "Source" : "Fuente"}</th></tr></thead>
          <tbody>{blockers.map((b) => <tr key={b.code}><td>{b.code}</td><td>{t(english, b.blocker)}</td><td>{t(english, b.source)}</td></tr>)}</tbody>
        </table></div>
        <p>{english ? "Pending P0 items include: a real Mixture of Experts model (ISA-003..017), security output gates (ISA-140/175), intelligence-router governance (ISA-125), verifiable deletion (ISA-427/428), and a secrets gate on protected CI branches (ISA-325). Source: Genesis D1/D2, §5.3." : "P0 pendientes incluyen: modelo Mixture of Experts real (ISA-003..017), gates de salida de seguridad (ISA-140/175), gobierno del router de inteligencia (ISA-125), borrado verificable (ISA-427/428) y gate de secretos en ramas protegidas de CI (ISA-325). Fuente: Genesis D1/D2, §5.3."}</p>
        <p>{english ? "Other declared figures, for context only: the TINA case study reports the repository OsoPanda1/isabella-ai-tina with 1,459 commits, 0 stars, 0 forks, 0 watchers, and 10 resolved hardening milestones (including purging 1,857 duplicate files and removing synthetic telemetry and fictitious DAO vote records). The “Soberanía TAMV” document (§7.1) cites a different test count — 1,225 local unit tests passed in 165 files, audited locally on 2026-10-07 — a different cut-off that no document explains against the 720 tests of 2026-09-26 (analysis §6.1, point 7). This page does not reconcile the two counts." : "Otras cifras declaradas, solo como contexto: el caso de estudio TINA reporta el repositorio OsoPanda1/isabella-ai-tina con 1.459 commits, 0 estrellas, 0 forks, 0 watchers y 10 hitos de hardening resueltos (entre ellos purga de 1.857 archivos duplicados y eliminación de telemetría sintética y de registros de votos DAO ficticios). El documento «Soberanía TAMV» (§7.1) cita otro conteo de tests — 1.225 tests unitarios locales aprobados en 165 archivos, auditado localmente el 2026-10-07 — un corte distinto que ningún documento explica frente a los 720 tests del 2026-09-26 (análisis §6.1, punto 7). Esta página no reconcilia ambos conteos."}</p>
      </details>

      <details className="doc-details" id="s1" open>
        <summary>{sections[1].num} · {t(english, sections[1].title)}</summary>
        <h3>{english ? "1.1 · FGAIS pipeline, 7 stages (Genesis D1, §2.1)" : "1.1 · Pipeline FGAIS, 7 etapas (Genesis D1, §2.1)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "No." : "N.º"}</th><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "Detail" : "Detalle"}</th></tr></thead>
          <tbody>{fgais.map((f) => <tr key={f.n}><td>{f.n}</td><td>{f.stage}</td><td>{t(english, f.detail)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "1.2 · Pentagonal network, 5 nodes (Genesis D1, §2.2)" : "1.2 · Red pentagonal, 5 nodos (Genesis D1, §2.2)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Node" : "Nodo"}</th><th>{english ? "Role" : "Rol"}</th><th>{english ? "Source" : "Fuente"}</th></tr></thead>
          <tbody>{pentagonal.map((p) => <tr key={p.node}><td>{p.node}</td><td>{t(english, p.role)}</td><td>{p.source}</td></tr>)}</tbody>
        </table></div>
        <p>{english ? "Canonical endpoints declared for the system: /api/isabella/chat, /api/isabella/isa/reason, /api/isabella/crypto/sign, /api/isabella/crypto/verify (Genesis D1, §1.1). Declared stack: Next.js / TanStack Start + Nitro monorepo, strict TypeScript; PostgreSQL/Neon; Prisma 7; Node.js 24.x (Docker node:24-alpine); pnpm 10.34.5; Vite 8; React 19 (Genesis D1, §1.1; D2, §5.2)." : "Endpoints canónicos declarados del sistema: /api/isabella/chat, /api/isabella/isa/reason, /api/isabella/crypto/sign, /api/isabella/crypto/verify (Genesis D1, §1.1). Stack declarado: monorepo Next.js / TanStack Start + Nitro, TypeScript estricto; PostgreSQL/Neon; Prisma 7; Node.js 24.x (Docker node:24-alpine); pnpm 10.34.5; Vite 8; React 19 (Genesis D1, §1.1; D2, §5.2)."}</p>
        <h3>{english ? "1.3 · Dual-layer Policy Gate with strict monotonicity (Genesis D2, §3.1)" : "1.3 · Policy Gate de doble capa con monotonía estricta (Genesis D2, §3.1)"}</h3>
        <p>{english ? "Layer 1 is static (policy-engine.ts, immutable rules). Layer 2 is a dynamic overlay (db-policy-gate.ts, over the isabella_policies table, introduced in commit 5dcef2d). Layer 2 can only harden or restrict Layer 1 permissions; it can never relax them or override vetoes. If DATABASE_URL is not configured, Layer 2 declares itself not_configured and inventing or assuming an ALLOW resolution is forbidden." : "La Capa 1 es estática (policy-engine.ts, reglas inmutables). La Capa 2 es un overlay dinámico (db-policy-gate.ts, sobre la tabla isabella_policies, introducida en el commit 5dcef2d). La Capa 2 solo puede endurecer o restringir los permisos de la Capa 1; jamás puede relajarlos ni anular vetos. Si DATABASE_URL no está configurada, la Capa 2 se declara not_configured y se prohíbe inventar o suponer una resolución ALLOW."}</p>
        <p>{english ? "Tools are deny-by-default, with no permanent or inherited permissions and just-in-time RBAC re-evaluation before dispatch. Secure egress runs only through SecuritySystem.fetchSafeUpstream: mandatory HTTPS, domain allowlist, and an absolute ban on following redirects (anti-SSRF). Territorial ABAC applies by node sovereignty, regulatory jurisdiction, and verified profile; zero trust: direct access to process.env is forbidden, secrets are centralised in config.ts, and the REDACTED convention applies to variables such as MEXA_API_SECURE_KEY or ISA_API_TOKEN (Genesis D1, §3.3; D2, §3.3)." : "Las herramientas son deny-by-default, sin permisos permanentes ni heredados y con reevaluación RBAC just-in-time pre-dispatch. El egress seguro corre solo por SecuritySystem.fetchSafeUpstream: HTTPS obligatorio, allowlist de dominios y prohibición absoluta de seguir redirecciones (anti-SSRF). Aplica ABAC territorial por soberanía del nodo, jurisdicción regulatoria y perfil verificado; cero confianza: prohibido el acceso directo a process.env, secretos centralizados en config.ts y convención REDACTED para variables como MEXA_API_SECURE_KEY o ISA_API_TOKEN (Genesis D1, §3.3; D2, §3.3)."}</p>
        <h3>{english ? "1.4 · Decision ledger isabella_decisions (Genesis D1, §3.2; D2, §3.2)" : "1.4 · Ledger isabella_decisions (Genesis D1, §3.2; D2, §3.2)"}</h3>
        <p>{english ? "JCS normalisation (RFC 8785); SHA3-512 hash; Dilithium-5 + MSR signature via the Mexa API (/api/isabella/crypto/sign); blocking pre-execution persistence: if the database or the cryptographic store fails at AUDIT, HsmDurableUnavailableError is thrown, the in-memory payload is invalidated, and the transaction is aborted." : "Normalización JCS (RFC 8785); hash SHA3-512; firma Dilithium-5 + MSR vía Mexa API (/api/isabella/crypto/sign); persistencia pre-ejecución bloqueante: si la DB o el almacén criptográfico falla en AUDIT, se lanza HsmDurableUnavailableError, se invalida el payload en memoria y se aborta la transacción."}</p>
        <h3>{english ? "1.5 · Hierarchical memory, 5 levels (Genesis D1/D2, §4.1)" : "1.5 · Memoria jerárquica, 5 niveles (Genesis D1/D2, §4.1)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Level" : "Nivel"}</th><th>{english ? "Detail" : "Detalle"}</th></tr></thead>
          <tbody>{memoryLevels.map((m) => <tr key={m.level}><td>{m.level}</td><td>{t(english, m.detail)}</td></tr>)}</tbody>
        </table></div>
        <div className="doc-note"><strong>{english ? "Unreconciled memory models" : "Modelos de memoria sin reconciliar"}</strong><span> {english ? "Two other memory models exist in the corpus and no document reconciles them with this one: the YUN Memory Mesh of 8 layers (episodic, semantic, procedural, contextual, organisational, territorial, scientific, federated — architecture and integration document, §3) and IKES / MSR / Federated Memory (“ISABELLA CERO…”, §2.3). They are three distinct models, not three names for one (analysis §3.6)." : "Existen otros dos modelos de memoria en el corpus y ningún documento los reconcilia con este: YUN Memory Mesh de 8 capas (episódica, semántica, procedimental, contextual, organizacional, territorial, científica y federada — documento de arquitectura e integración, §3) e IKES / MSR / Federated Memory («ISABELLA CERO…», §2.3). Son tres modelos distintos, no tres nombres para uno (análisis §3.6)."}</span></div>
      </details>

      <details className="doc-details" id="s2" open>
        <summary>{sections[2].num} · {t(english, sections[2].title)}</summary>
        <p>{english ? "TINA has a single definition in the entire corpus, only in the case study “Isabella AI TINA: Caso de Estudio Técnico, Gobernanza e Innovación Soberana”, §1: TINA = “Trusted Intelligence, Native & Adaptive”. Everywhere else it appears only as a nominal mention — in the architecture and integration document only in §8 as a proprietary neologism (“TINA H6”) to be translated into standard terminology, without a definition; in “ISABELLA CERO…” only as a component of Pillar II (Cognition) and in the repository name isabella-V6-TINA-h6; in “Soberanía TAMV” as “Isabella Villaseñor AI (TINA)”; in the C.R.O.W.N. technical operations document it has zero mentions (analysis §3.2)." : "TINA tiene una ÚNICA definición en todo el corpus, solo en el caso de estudio «Isabella AI TINA: Caso de Estudio Técnico, Gobernanza e Innovación Soberana», §1: TINA = «Trusted Intelligence, Native & Adaptive». En el resto aparece solo como mención nominal — en el documento de arquitectura e integración únicamente en §8 como neologismo propietario («TINA H6») que debe traducirse a terminología estándar, sin definición; en «ISABELLA CERO…» solo como componente del Pilar II (Cognición) y en el nombre del repositorio isabella-V6-TINA-h6; en «Soberanía TAMV» como «Isabella Villaseñor AI (TINA)»; en el documento técnico operativo de C.R.O.W.N. tiene cero menciones (análisis §3.2)."}</p>
        <h3>{english ? "2.1 · Central formula, 6 links (TINA case study, §2)" : "2.1 · Fórmula central, 6 eslabones (caso de estudio TINA, §2)"}</h3>
        <p><code>CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION</code></p>
        <p>{english ? "Capability is mere existence in code, inert without policy; authority is policy approval and does not guarantee execution; execution is a side effect and generates no immutable proof; evidence consists of local traces that do not certify security or production; learning is not promoted to the runtime without a verification pipeline; production requires verifiable proof of durable infrastructure." : "La capacidad es mera existencia en código, inerte sin política; la autoridad es aprobación de política, no garantiza ejecución; la ejecución es un side effect, no genera prueba inmutable; la evidencia son trazas locales, no certifican seguridad ni producción; el aprendizaje no se promueve al runtime sin pipeline de verificación; la producción exige verificación comprobable de infraestructura duradera."}</p>
        <p>{english ? "For each transaction, nine forensic audit questions apply: what it did, why, under which authority, with which evidence, which data it used, which provider took part, which limits applied, what happened if it failed, and what remains unverified (TINA case study, §2)." : "Por cada transacción aplican nueve preguntas de auditoría forense: qué hizo, por qué, con qué autoridad, con qué evidencia, qué datos utilizó, qué proveedor participó, qué límites aplicaron, qué ocurrió si falló y qué permanece sin verificar (caso de estudio TINA, §2)."}</p>
        <h3>{english ? "2.2 · Cycle of 9 non-skippable stages (TINA case study, §4)" : "2.2 · Ciclo de 9 etapas no puenteables (caso de estudio TINA, §4)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "No." : "N.º"}</th><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "Detail" : "Detalle"}</th></tr></thead>
          <tbody>{tinaCycle.map((s) => <tr key={s.n}><td>{s.n}</td><td>{t(english, s.stage)}</td><td>{t(english, s.detail)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "2.3 · 20 subsystems (TINA case study, §4)" : "2.3 · 20 subsistemas (caso de estudio TINA, §4)"}</h3>
        <p>{subsystems.join(" · ")}</p>
        <h3>{english ? "2.4 · Dual Kernel and the 7 verification states (TINA case study, §§4, 6)" : "2.4 · Dual Kernel y los 7 estados de verificación (caso de estudio TINA, §§4, 6)"}</h3>
        <p>{english ? "On failure of an external LLM, the system answers with deterministic local logic and must be labelled immutably as DEGRADED; “simulating functional equivalence with remote models is forbidden”. The governing rule: “Under no circumstances does the lack of infrastructure report a PASS state.”" : "Ante fallo de un LLM externo, el sistema responde con lógica determinista local y debe etiquetarse de forma inmutable como DEGRADED; «está prohibido simular equivalencia funcional con modelos remotos». La regla rectora: «Bajo ninguna circunstancia la falta de infraestructura reporta un estado PASS»."}</p>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "State" : "Estado"}</th><th>{english ? "Note" : "Nota"}</th></tr></thead>
          <tbody>{verificationStates.map((v) => <tr key={v.state}><td>{v.state}</td><td>{t(english, v.note)}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "2.5 · 11 pending areas of technical debt (TINA case study, §6)" : "2.5 · 11 áreas de deuda técnica pendientes (caso de estudio TINA, §6)"}</h3>
        <ul>{techDebt.map((d) => <li key={d.area.es}>{t(english, d.area)}</li>)}</ul>
        <p>{english ? "Declared state: version 4.3.3, repository OsoPanda1/isabella-ai-tina, domain isabella-ai.visitarealdelmonte.online, “Prototype / Executable architecture in evolution”, “Not certified for production”." : "Estado declarado: versión 4.3.3, repositorio OsoPanda1/isabella-ai-tina, dominio isabella-ai.visitarealdelmonte.online, «Prototipo / Arquitectura ejecutable en evolución», «No certificada para producción»."}</p>
      </details>

      <details className="doc-details" id="s3" open>
        <summary>{sections[3].num} · {t(english, sections[3].title)}</summary>
        <p>{english ? "The only expansion of the acronym in the entire corpus is “C.R.O.W.N. (Constitution of the Reality Ontological Web Native)”, in the technical operations document (“Documentación Técnica Operativa: C.R.O.W.N. e Isabella VΩ”, §1), where it is presented as a “constitutional operating system of native web (ZT-DCOS)” with a strict separation between the normative plane (C.R.O.W.N. Constitution) and the executable plane (YUN Runtime). It is not decomposed letter by letter in any document." : "La única expansión del acrónimo en todo el corpus es «C.R.O.W.N. (Constitution of the Reality Ontological Web Native)», en el documento técnico operativo («Documentación Técnica Operativa: C.R.O.W.N. e Isabella VΩ», §1), donde se presenta como «sistema operativo constitucional de web nativa (ZT-DCOS)» con separación estricta entre plano normativo (Constitución C.R.O.W.N.) y plano ejecutable (Runtime YUN). No se descompone letra por letra en ningún documento."}</p>
        <p>{english ? "Elsewhere in the corpus, CROWN appears without periods and without expansion, as a Policy Decision Point (PDP) that evaluates risk deny-by-default, with AEGIS/ARGUS as the Policy Enforcement Point (PEP) (Genesis v4.3.3, §3.1; TINA case study, §§2, 4, 5). This page presents CROWN as a PDP and as Policy-as-Code, with AEGIS/ARGUS as PEP, and does not decompose the acronym letter by letter." : "En el resto del corpus, CROWN aparece sin puntos y sin expansión, como Policy Decision Point (PDP) que evalúa riesgo deny-by-default, con AEGIS/ARGUS como Policy Enforcement Point (PEP) (Genesis v4.3.3, §3.1; caso de estudio TINA, §§2, 4, 5). Esta página presenta CROWN como PDP y como Policy-as-Code, con AEGIS/ARGUS como PEP, y no descompone el acrónimo letra por letra."}</p>
        <div className="doc-warning" role="note">
          <strong>{english ? "Unreconciled tension: two authorisation formulas" : "Tensión sin reconciliar: dos fórmulas de autorización"}</strong>
          <p>{english ? "“ISABELLA CERO…” (§8.1) gives CROWN as a deterministic authorisation engine with a 5-vector rule: ALLOW = IDENTITY × AUTHORITY × POLICY × EVIDENCE × SAFETY. The architecture and integration document (§3) gives an 8-factor legitimacy equation: Legitimacy = Identity × Authority × Policy × Evidence × Execution × Traceability × Governance × Human Oversight, with a fail-closed rule — if any factor is 0, legitimacy is 0 → DENY. No document reconciles the two formulas (analysis §3.3). (In “ISABELLA CERO…” §3.2, CROWN is also glossed in a diagram as “Constitutional Safety Product Evaluation”; that gloss is recorded here and not adopted as the expansion.)" : "«ISABELLA CERO…» (§8.1) presenta CROWN como motor determinista de autorización con regla de 5 vectores: ALLOW = IDENTITY × AUTHORITY × POLICY × EVIDENCE × SAFETY. El documento de arquitectura e integración (§3) da una ecuación de legitimidad de 8 factores: Legitimacy = Identity × Authority × Policy × Evidence × Execution × Traceability × Governance × Human Oversight, con regla fail-closed — si un factor es 0, la legitimidad es 0 → DENY. Ningún documento reconcilia ambas fórmulas (análisis §3.3). (En «ISABELLA CERO…» §3.2, CROWN también se glosa en un diagrama como «Constitutional Safety Product Evaluation»; esa glosa se registra aquí y no se adopta como expansión.)"}</p>
        </div>
      </details>

      <details className="doc-details" id="s4" open>
        <summary>{sections[4].num} · {t(english, sections[4].title)}</summary>
        <p>{english ? "BookPI is the ecosystem's evidence ledger, described as a hash-chained append-only ledger: Dₙ = SHA3-512(Blockₙ + Dₙ₋₁), said to “guarantee forensic non-repudiation and immutability of the chain of custody” (architecture and integration document, §2). It also appears as a “SHA3-512 Cryptographic Evidence Writer” / “Unified Evidence Fabric” sealing each inference (hash of sources, licence, certainty, latency) (“ISABELLA CERO…”, §§3.2, 8.3), and as a decision ledger and lineage with Trace IDs and Correlation IDs, where ANUBIS computes canonical hashes of request, context, policy, and response (TINA case study, §4)." : "BookPI es el ledger de evidencia del ecosistema, descrito como un ledger append-only con hash-chaining: Dₙ = SHA3-512(Blockₙ + Dₙ₋₁), del que se dice que «garantiza no repudio forense e inmutabilidad de cadena de custodia» (documento de arquitectura e integración, §2). También aparece como «SHA3-512 Cryptographic Evidence Writer» / «Unified Evidence Fabric» que sella cada inferencia (hash de fuentes, licencia, certeza, latencia) («ISABELLA CERO…», §§3.2, 8.3), y como decision ledger y linaje con Trace IDs y Correlation IDs, donde ANUBIS calcula hashes canónicos de solicitud, contexto, política y respuesta (caso de estudio TINA, §4)."}</p>
        <p><code>Dₙ = SHA3-512(Blockₙ + Dₙ₋₁)</code></p>
        <div className="doc-note"><strong>{english ? "Mandatory caution" : "Cautela obligatoria"}</strong><span> {english ? "In the corpus, “immutable” and “unalterable” are used as properties of the ledger without any document providing an external anchor or an independent audit that verifies them. On this page, immutability is an architectural objective, not a demonstrated property (analysis §3.5)." : "En el corpus, «inmutable» e «inalterable» se usan como propiedades del ledger sin que ningún documento aporte una ancla externa o una auditoría independiente que las verifique. En esta página, la inmutabilidad es un objetivo arquitectónico, no una propiedad demostrada (análisis §3.5)."}</span></div>
        <p>{english ? "BookPI appears in the Genesis v4.3.3 reports only once (D2, §6.2), as a pre-existing component that justified discarding packages/tamv-kernel for duplication; the operational ledger of those reports is the PostgreSQL table isabella_decisions with SHA3-512 chaining and verifyChain (§1.4 above). The hub's own proposal-event chain (proposal_events, with chained SHA-256 hashes) is a related local pattern in this repository: it is mentioned here as a textual link only — no integration between BookPI and the repository's proposal chain is asserted, because no document states one." : "BookPI aparece en los informes Genesis v4.3.3 una sola vez (D2, §6.2), como componente ya existente que justificó descartar packages/tamv-kernel por duplicidad; el ledger operativo de esos informes es la tabla PostgreSQL isabella_decisions con encadenamiento SHA3-512 y verificación verifyChain (§1.4 arriba). La cadena de eventos de propuestas propia del hub (proposal_events, con hashes SHA-256 encadenados) es un patrón local relacionado en este repositorio: se menciona aquí solo como enlace en texto — no se afirma ninguna integración entre BookPI y la cadena de propuestas del repositorio, porque ningún documento la declara."}</p>
        <p>{english ? "BookPI is also described in mutually incompatible ways across documents: as the single source of truth (Manual Maestro, §5); as one of two JSONL records alongside MSR (Atlas V4, §V); and as a PI-anchoring protocol under MSR (“UNIFICA Y MEJORA TAMV MD‑X4™”, §III). No document reconciles these versions (analysis §3.5)." : "BookPI también se describe de formas mutuamente incompatibles entre documentos: como SSoT único (Manual Maestro, §5); como uno de dos registros JSONL junto a MSR (Atlas V4, §V); y como protocolo de anclaje de PI bajo MSR («UNIFICA Y MEJORA TAMV MD‑X4™», §III). Ningún documento reconcilia estas versiones (análisis §3.5)."}</p>
      </details>

      <details className="doc-details" id="s5" open>
        <summary>{sections[5].num} · {t(english, sections[5].title)}</summary>
        <p>{english ? "The Hyper Core Turbo Ω-X3 cognitive acceleration engine exists only in “ISABELLA CERO…” (§3), as the foundational delivery ISABELLA-CERO-V1.1-FOUNDATIONAL-DELIVERY (identifier CANON-EOC-ISABELLA-CERO-HCT-X3-LLM-2026-V1.0, November 2026). Its headline figures are declared objectives, not measured results: up to 3.0× speedup; total latency 900 ms → 300 ms (66.7%)." : "El motor de aceleración cognitiva Hyper Core Turbo Ω-X3 solo existe en «ISABELLA CERO…» (§3), como entrega fundacional ISABELLA-CERO-V1.1-FOUNDATIONAL-DELIVERY (identificador CANON-EOC-ISABELLA-CERO-HCT-X3-LLM-2026-V1.0, noviembre de 2026). Sus cifras principales son objetivos declarados, no resultados medidos: hasta 3.0× de speedup; latencia total 900 ms → 300 ms (66,7%)."}</p>
        <div className="doc-warning" role="note">
          <ShieldAlert aria-hidden="true" />
          <strong>{english ? "OBJECTIVES TO VALIDATE — NOT RESULTS" : "OBJETIVOS A VALIDAR — NO RESULTADOS"}</strong>
          <p>{english ? "“Engineering goals do not represent results guaranteed a priori, but measurable objectives that must be validated empirically through public, reproducible benchmarks” (“ISABELLA CERO…”, §1). The same document states SPECIFIED ≠ IMPLEMENTED ≠ TESTED ≠ VERIFIED ≠ PRODUCTION (§2.2). Nothing on this page presents 3.0× or 900→300 ms as achieved." : "«Las metas de ingeniería no representan resultados garantizados a priori, sino objetivos medibles que deben ser validados empíricamente mediante benchmarks públicos, reproducibles» («ISABELLA CERO…», §1). El mismo documento afirma SPECIFIED ≠ IMPLEMENTED ≠ TESTED ≠ VERIFIED ≠ PRODUCTION (§2.2). Nada en esta página presenta 3.0× ni 900→300 ms como logrados."}</p>
        </div>
        <h3>{english ? "5.1 · Seven mechanisms, ranges declared as objectives" : "5.1 · Siete mecanismos, rangos declarados como objetivos"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Mechanism" : "Mecanismo"}</th><th>{english ? "Declared range (objective)" : "Rango declarado (objetivo)"}</th></tr></thead>
          <tbody>{hyperCore.map((h) => <tr key={h.mechanism.es}><td>{t(english, h.mechanism)}</td><td>{h.range.replace("{calls}", english ? "model calls" : "llamadas al modelo").replace("{wait}", english ? "wait" : "espera").replace("{costs}", english ? "costs" : "costos").replace("{tokens}", english ? "tokens" : "tokens")}</td></tr>)}</tbody>
        </table></div>
        <h3>{english ? "5.2 · Latency budget per stage (base → objective)" : "5.2 · Presupuesto de latencia por etapa (base → objetivo)"}</h3>
        <div className="doc-table-wrap"><table className="doc-table">
          <thead><tr><th>{english ? "Stage" : "Etapa"}</th><th>{english ? "Base" : "Base"}</th><th>{english ? "Objective" : "Objetivo"}</th></tr></thead>
          <tbody>{latencyBudget.map((l) => <tr key={l.stage.es}><td>{t(english, l.stage)}</td><td>{l.from}</td><td>{l.to}</td></tr>)}</tbody>
        </table></div>
        <p>{english ? "Three blocks: Request Router (Semantic Cache, Model Router Fast/Auto/Reasoning/Code, Speculative Planner, Context Compressor); Execution Fabric (FastLane, Parallel Agent Mesh DAG, KV Cache Fabric, GPU/CPU/Edge workers, NATS JetStream); Governance Fabric (CROWN, BookPI SHA3-512, Sentinel-X, OpenTelemetry telemetry). Source: “ISABELLA CERO…”, §3. The architecture and integration document mentions only “HyperCore Ω²” inside Ω-CORE and does not contain “Hyper Core Turbo Ω-X3”; “Soberanía TAMV” (§4.2) describes a different “Motor Hypercore” (CRUISE/BOOST/HYPERBOOST modes) with the invariant “no turbo or nitro grants authorisation; the mandatoryGate always runs”." : "Tres bloques: Request Router (Semantic Cache, Model Router Fast/Auto/Reasoning/Code, Speculative Planner, Context Compressor); Execution Fabric (FastLane, Parallel Agent Mesh DAG, KV Cache Fabric, workers GPU/CPU/Edge, NATS JetStream); Governance Fabric (CROWN, BookPI SHA3-512, Sentinel-X, telemetría OpenTelemetry). Fuente: «ISABELLA CERO…», §3. El documento de arquitectura e integración menciona solo «HyperCore Ω²» dentro de Ω-CORE y no contiene «Hyper Core Turbo Ω-X3»; «Soberanía TAMV» (§4.2) describe un «Motor Hypercore» distinto (modos CRUISE/BOOST/HYPERBOOST) con el invariante «ningún turbo ni nitro concede autorización; el mandatoryGate se ejecuta siempre»."}</p>
        <p>{english ? "“Isabella VΩ” is not defined in any document: it appears only in the title of the C.R.O.W.N. technical operations document. It is not presented here as a version or a product." : "«Isabella VΩ» no se define en ningún documento: aparece solo en el título del documento técnico operativo de C.R.O.W.N. No se presenta aquí como versión ni como producto."}</p>
      </details>

      <details className="doc-details" id="s6" open>
        <summary>{sections[6].num} · {t(english, sections[6].title)}</summary>
        <h3>{english ? "6.1 · De-anthropomorphisation (Canonical Document, §2.4 — preserved)" : "6.1 · Des-antropomorfización (Documento Canónico, §2.4 — preservada)"}</h3>
        <p>{english ? "Isabella is not a person, has no human consciousness or emotions, does not replace medical, legal, psychological, or security professionals, and must not hide its limits. (Canonical Document, §2.4.)" : "Isabella: no es persona, no tiene conciencia ni emociones humanas, no sustituye profesionales médicos/jurídicos/psicológicos/de seguridad, no debe ocultar sus límites. (Documento Canónico, §2.4.)"}</p>
        <div className="doc-warning" role="note">
          <strong>{english ? "Tension with Atlas V4" : "Tensión con el Atlas V4"}</strong>
          <p>{english ? "Atlas V4 characterises Isabella as a “computational emotional entity” with “explicit protection biases” and “persistent affective vector memory” (Atlas V4, §II). That characterisation is in tension with the de-anthropomorphisation of §2.4 above. This page preserves §2.4 and records the tension; it does not resolve it." : "El Atlas V4 caracteriza a Isabella como «entidad emocional computacional» con «sesgos de protección explícitos» y «memoria vectorial afectiva persistente» (Atlas V4, §II). Esa caracterización tensiona la des-antropomorfización de §2.4 arriba. Esta página preserva §2.4 y registra la tensión; no la resuelve."}</p>
        </div>
        <h3>{english ? "6.2 · Not documented in the Drive corpus" : "6.2 · No documentado en el corpus de Drive"}</h3>
        <p>{english ? "CTH/ISK and “Trinidad vLLM” have zero mentions in the 20 documents read. vLLM appears only as a generic local inference runtime in the “ISABELLA CERO…” stack (§5.1), alongside Ollama and llama.cpp. They are mentioned here only as “not documented in the Drive corpus” and are not presented as documented content (analysis §3.8)." : "CTH/ISK y «Trinidad vLLM» tienen CERO menciones en los 20 documentos leídos. vLLM aparece solo como runtime genérico de inferencia local en el stack de «ISABELLA CERO…» (§5.1), junto a Ollama y llama.cpp. Se mencionan aquí solo como «no documentado en el corpus de Drive» y no se presentan como contenido documentado (análisis §3.8)."}</p>
        <h3>{english ? "6.3 · Sources and scope of this page" : "6.3 · Fuentes y alcance de esta página"}</h3>
        <p>{english ? "Sources: “INFORME GLOBAL DE PRESENTACIÓN TÉCNICA Y DE GOBERNANZA: ISABELLA AI GENESIS (v4.3.3)” (D1) and “Isabella AI Genesis: Documento de Presentación Global” (D2), cut-off 2026-09-26; “Isabella AI TINA: Caso de Estudio Técnico, Gobernanza e Innovación Soberana”; “ISABELLA CERO: Arquitectura Fundacional, Motor Hyper Core Turbo Ω-X3 y Ecosistema Cognitive-Governed”; “Documentación Técnica Operativa: C.R.O.W.N. e Isabella VΩ”; “DOCUMENTO CANÓNICO — Edwin Oswaldo Castillo Trejo — Anubis Villaseñor — Isabella AI Genesis”; “Arquitectura, Gobernanza e Integración del Ecosistema TAMV Online Network e Isabella AI”; Atlas V4; “Soberanía TAMV”. Everything stated here is what those documents say about themselves; no technical claim, metric, or deployment was verified against live code, repositories, or services. Where documents contradict each other, this page records the contradiction and states its preferred source, without resolving it by its own authority (analysis, Anexo A.3)." : "Fuentes: «INFORME GLOBAL DE PRESENTACIÓN TÉCNICA Y DE GOBERNANZA: ISABELLA AI GENESIS (v4.3.3)» (D1) e «Isabella AI Genesis: Documento de Presentación Global» (D2), corte 2026-09-26; «Isabella AI TINA: Caso de Estudio Técnico, Gobernanza e Innovación Soberana»; «ISABELLA CERO: Arquitectura Fundacional, Motor Hyper Core Turbo Ω-X3 y Ecosistema Cognitive-Governed»; «Documentación Técnica Operativa: C.R.O.W.N. e Isabella VΩ»; «DOCUMENTO CANÓNICO — Edwin Oswaldo Castillo Trejo — Anubis Villaseñor — Isabella AI Genesis»; «Arquitectura, Gobernanza e Integración del Ecosistema TAMV Online Network e Isabella AI»; Atlas V4; «Soberanía TAMV». Todo lo afirmado aquí es lo que esos documentos dicen de sí mismos; ninguna afirmación técnica, métrica o de despliegue fue verificada contra código, repositorios o servicios en vivo. Donde los documentos se contradicen, esta página registra la contradicción y declara su fuente preferente, sin resolverla por autoridad propia (análisis, Anexo A.3)."}</p>
        <p><Link className="text-link" href={`/proyectos?lang=${locale}`}>{english ? "Back to the project catalog" : "Volver al catálogo de proyectos"} <ArrowUpRight aria-hidden="true" /></Link></p>
        <p><Link className="text-link" href={`/desarrolladores?lang=${locale}`}>{english ? "Developer interfaces and public API" : "Interfaces para desarrollo y API pública"} <ArrowUpRight aria-hidden="true" /></Link></p>
      </details>

    </div></section>
  <TamvSectionMedia area="isabella" locale={locale} />
      </TamvAppShell>
}
