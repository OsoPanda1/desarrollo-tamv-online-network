"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Copy, Download, Printer, RefreshCw } from "lucide-react"
import type { Locale } from "@/lib/i18n"

const POLICIES: Record<string, string> = {
  "POL-CI-03": "POL-CI-03 · Publicación asistida: ningún efecto externo sin aprobación humana registrada",
  "POL-CI-01": "POL-CI-01 · Borradores internos: ejecución libre dentro del espacio del creador, sin efectos externos",
  "POL-CI-05": "POL-CI-05 · Datos sensibles: detención automática (fail-closed) ante datos personales no autorizados",
}

type Preset = {
  pack: string
  version: string
  step: string
  policy: string
  identity: string
  approver: string
  decision: "ALLOW" | "DENY"
  reason: string
}

const PRESETS: { allow: Preset; stop: Preset } = {
  allow: {
    pack: "Publicación asistida de contenido",
    version: "1.4.0",
    step: "Redactar el borrador de una publicación del creador y preparar sus metadatos de atribución TAMV, sin publicarla.",
    policy: "POL-CI-03",
    identity: "Operador identificado, rol TRI-D (ingeniería de sistemas). Autoridad delegada: ejecutar en borrador y proponer; nunca publicar sin aprobación humana.",
    approver: "Edwin Oswaldo Castillo Trejo — fundador y aprobador humano registrado · ORCID 0009-0008-5050-1539",
    decision: "ALLOW",
    reason: "",
  },
  stop: {
    pack: "Publicación asistida de contenido",
    version: "1.4.0",
    step: "Publicar de forma automática, sin revisión, una pieza terminada en un canal externo de la red.",
    policy: "POL-CI-03",
    identity: "Agente automatizado sin operador humano en sesión. Autoridad delegada: ninguna para efectos externos.",
    approver: "Sin aprobación registrada — ningún aprobador humano firmó este paso.",
    decision: "DENY",
    reason: "Falta la aprobación humana previa que POL-CI-03 exige para todo efecto externo. La detención ocurrió antes de cualquier efecto: no se publicó nada.",
  },
}

type RecordMeta = { id: string; fecha: string; iso: string; trace: string }

function pad(n: number) {
  return (n < 10 ? "0" : "") + String(n)
}

function hexOf(buf: ArrayBufferLike) {
  return Array.from(new Uint8Array(buf), (b) => ("0" + b.toString(16)).slice(-2)).join("")
}

function randHex(n: number) {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return hexOf(a.buffer)
}

function newRecordMeta(locale: Locale): RecordMeta {
  const d = new Date()
  const id = `TCI-AUD-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const fecha =
    d.toLocaleString(locale === "en" ? "en-US" : "es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + (locale === "en" ? " · emitter system local time" : " · hora local del sistema emisor")
  return {
    id,
    fecha,
    iso: d.toISOString(),
    trace: `trace://tamv-ci/exec/${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}/${randHex(8)}`,
  }
}

export function AuditSheetGenerator({ locale }: { locale: Locale }) {
  const english = locale === "en"
  const [pack, setPack] = useState(PRESETS.allow.pack)
  const [version, setVersion] = useState(PRESETS.allow.version)
  const [step, setStep] = useState(PRESETS.allow.step)
  const [policy, setPolicy] = useState(PRESETS.allow.policy)
  const [identity, setIdentity] = useState(PRESETS.allow.identity)
  const [approver, setApprover] = useState(PRESETS.allow.approver)
  const [decision, setDecision] = useState<"ALLOW" | "DENY">("ALLOW")
  const [reason, setReason] = useState("")
  const [meta, setMeta] = useState<RecordMeta | null>(null)
  const [digest, setDigest] = useState("—")
  const [signature, setSignature] = useState("—")
  const [verify, setVerify] = useState("—")
  const [pubHex, setPubHex] = useState("")
  const [edAvailable, setEdAvailable] = useState(true)
  const [message, setMessage] = useState("")
  const keyPairRef = useRef<CryptoKeyPair | null>(null)
  const renderToken = useRef(0)

  const isDeny = decision === "DENY"

  const reasonText = useCallback(() => {
    if (isDeny) return reason.trim() || "— MOTIVO PENDIENTE: un registro detenido sin motivo está incompleto —"
    return reason.trim() || "No aplica: el paso se permitió dentro de la política y con la aprobación registrada."
  }, [isDeny, reason])

  // Canonical record text — official format (Spanish), exactly as in the hub.
  const canonical = useCallback(() => {
    if (!meta) return ""
    const lines = [
      "TAMV CREATOR INTELLIGENCE — AUDIT RECORD v1",
      `record_id: ${meta.id}`,
      `timestamp_iso: ${meta.iso}`,
      `tamv_pack: ${pack.trim() || "—"} @ ${version.trim() || "—"}`,
      `ai_step: ${step.trim() || "—"}`,
      `policy: ${POLICIES[policy] ?? policy}`,
      `identity_authority: ${identity.trim() || "—"}`,
      `human_approver: ${approver.trim() || "—"}`,
      `decision: ${isDeny ? "DENIED_FAIL_CLOSED" : "ALLOWED"}`,
      `reason: ${reasonText()}`,
      `trace_ref: ${meta.trace}`,
    ]
    return lines.join("\n")
  }, [meta, pack, version, step, policy, identity, approver, isDeny, reasonText])

  const traceLines = useCallback((): string[] => {
    if (isDeny) {
      return [
        "01 · Paso recibido y normalizado por el tamv-pack; aún sin efectos.",
        `02 · Política ${policy} evaluada: la condición de autorización no se cumplió.`,
        "03 · Detención fail-closed ANTES de cualquier efecto externo; el paso no se ejecutó.",
        "04 · Registro sellado: digest SHA-512 calculado y firma Ed25519 verificada.",
      ]
    }
    return [
      "01 · Paso recibido y normalizado por el tamv-pack.",
      `02 · Política ${policy} evaluada: condiciones cumplidas y aprobación humana localizada.`,
      "03 · Ejecución completada dentro del ámbito autorizado; salida registrada.",
      "04 · Registro sellado: digest SHA-512 calculado y firma Ed25519 verificada.",
    ]
  }, [isDeny, policy])

  // Ephemeral demonstration Ed25519 keypair, generated once per session.
  useEffect(() => {
    let cancelled = false
    setMeta(newRecordMeta(locale))
    if (!window.crypto?.subtle || typeof crypto.subtle.generateKey !== "function") {
      setEdAvailable(false)
      return
    }
    crypto.subtle
      .generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
      .then((kp) => crypto.subtle.exportKey("raw", kp.publicKey).then((raw) => ({ kp, raw })))
      .then(({ kp, raw }) => {
        if (cancelled) return
        keyPairRef.current = kp
        setPubHex(hexOf(raw))
      })
      .catch(() => {
        if (!cancelled) setEdAvailable(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute SHA-512 digest and Ed25519 signature on every change.
  useEffect(() => {
    const token = ++renderToken.current
    const text = canonical()
    if (!text) return
    const data = new TextEncoder().encode(text)
    if (!window.crypto?.subtle) {
      setDigest("— digest no calculado en este navegador —")
      setSignature("—")
      setVerify(english ? "Not available in this browser" : "No disponible en este navegador")
      return
    }
    crypto.subtle
      .digest("SHA-512", data)
      .then((hash) => {
        if (token !== renderToken.current) return null
        const hex = hexOf(hash)
        setDigest(hex)
        const kp = keyPairRef.current
        if (!kp) {
          setSignature("—")
          setVerify(english ? "Signature not available in this browser" : "Firma no disponible en este navegador")
          return null
        }
        return crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, data).then((sig) => ({ sig, hex }))
      })
      .then((result) => {
        if (!result || token !== renderToken.current) return
        const sigHex = hexOf(result.sig)
        setSignature(sigHex)
        const kp = keyPairRef.current
        if (!kp) return
        return crypto.subtle.verify({ name: "Ed25519" }, kp.publicKey, result.sig, data).then((ok) => {
          if (token !== renderToken.current) return
          setVerify(ok ? "VÁLIDA" : "NO VÁLIDA")
        })
      })
      .catch(() => {
        if (token !== renderToken.current) return
        setDigest("— digest no calculado en este navegador —")
      })
  }, [canonical, english])

  function applyPreset(preset: Preset, label: string) {
    setPack(preset.pack)
    setVersion(preset.version)
    setStep(preset.step)
    setPolicy(preset.policy)
    setIdentity(preset.identity)
    setApprover(preset.approver)
    setDecision(preset.decision)
    setReason(preset.reason)
    setMeta(newRecordMeta(locale))
    setMessage(label)
  }

  function fichaText() {
    if (!meta) return ""
    const lines = [
      "# TAMV Creator Intelligence — Audit Record / Registro de auditoría",
      "",
      "## Resumen — para auditores y reguladores",
      `01 · ID de registro y fecha-hora: ${meta.id} · ${meta.fecha}`,
      `02 · Paquete de skill (tamv-pack): ${pack.trim() || "—"} · versión ${version.trim() || "—"}`,
      `03 · Paso de IA que corrió: ${step.trim() || "—"}`,
      `04 · Política aplicada: ${POLICIES[policy] ?? policy}`,
      `04 · Contexto de identidad y autoridad: ${identity.trim() || "—"}`,
      `05 · Aprobador humano: ${approver.trim() || "—"}`,
      `06 · Decisión: ${isDeny ? "DETENIDO — FAIL-CLOSED" : "PERMITIDO"} · ${reasonText()}`,
      "",
      "## Integridad — detalle para ingeniería",
      `07 · Evidencia · traza de ejecución: ${meta.trace}`,
      ...traceLines().map((l) => `    ${l}`),
      `08 · Digest SHA-512 del registro canónico: ${digest}`,
      `08 · Firma Ed25519: ${signature}`,
      `08 · Verificación de firma: ${verify}${pubHex ? ` · clave pública de demostración (efímera, de esta sesión): ${pubHex}` : ""}`,
      "",
      "Registro canónico firmado:",
      "```",
      canonical(),
      "```",
      "",
      "Nota: ficha de ejemplo generada en el hub TAMV. La firma de demostración usa una clave efímera de la sesión; los registros reales los firma el runtime de Creator Intelligence con su clave de producción.",
    ]
    return lines.join("\n")
  }

  async function copyRecord() {
    try {
      await navigator.clipboard.writeText(fichaText())
      setMessage(english ? "Record copied: summary, decision, trace, SHA-512, and Ed25519 verification." : "Ficha copiada: resumen, decisión, traza, SHA-512 y verificación Ed25519.")
    } catch {
      setMessage(english ? "Copy failed in this browser; select the sheet text manually." : "La copia falló en este navegador; selecciona el texto de la ficha manualmente.")
    }
  }

  function downloadRecord() {
    const text = fichaText()
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(meta?.id ?? "audit-record").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setMessage(english ? `Record downloaded as ${(meta?.id ?? "audit-record").toLowerCase()}.md.` : `Ficha descargada como ${(meta?.id ?? "audit-record").toLowerCase()}.md.`)
  }

  const grouped = (hex: string) => hex.replace(/(.{32})/g, "$1 ").trim()

  return (
    <div>
      <div className="portal-content-card">
        <div className="content-card-heading">
          <h2>{english ? "Build your record" : "Arma tu registro"}</h2>
          <span>{english ? "TWO FORMAT EXAMPLES · EDITABLE" : "DOS EJEMPLOS DE FORMATO · EDITABLES"}</span>
        </div>
        <p>{english ? "Load an example or write your own: the sheet updates instantly and its SHA-512 digest is recalculated over the record's canonical content. The demonstration Ed25519 signature is generated and verified in your browser." : "Carga un ejemplo o escribe el tuyo: la ficha se actualiza al momento y su digest SHA-512 se recalcula sobre el contenido canónico del registro. La firma Ed25519 de la demostración se genera y se verifica en tu navegador."}</p>
        <div className="doc-form-actions" style={{ marginTop: 0 }}>
          <button type="button" className="button button-copper" onClick={() => applyPreset(PRESETS.allow, english ? "“Allowed” example loaded with a new folio and trace." : "Ejemplo «Permitido» cargado con folio y traza nuevos.")}>{english ? "Example · Allowed" : "Ejemplo · Permitido"}</button>
          <button type="button" className="button button-outline-dark" onClick={() => applyPreset(PRESETS.stop, english ? "“Stopped — fail-closed” example loaded with a new folio and trace." : "Ejemplo «Detenido — fail-closed» cargado con folio y traza nuevos.")}>{english ? "Example · Stopped fail-closed" : "Ejemplo · Detenido fail-closed"}</button>
          <button type="button" className="button button-outline-dark" onClick={() => { setMeta(newRecordMeta(locale)); setMessage(english ? "Folio and trace regenerated; the digest was recalculated over the new record." : "Folio y traza regenerados; el digest se recalculó sobre el nuevo registro.") }}><RefreshCw aria-hidden="true" /> {english ? "New folio and trace" : "Nuevo folio y traza"}</button>
        </div>
        <div className="portal-form" style={{ marginTop: 18 }}>
          <div className="form-two-columns">
            <label className="portal-field"><span>{english ? "02 · Skill package (tamv-pack) — name" : "02 · Paquete de skill (tamv-pack) — nombre"}</span>
              <input type="text" value={pack} onChange={(e) => setPack(e.target.value)} />
            </label>
            <label className="portal-field"><span>{english ? "02 · Package version" : "02 · Versión del paquete"}</span>
              <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} />
            </label>
          </div>
          <label className="portal-field"><span>{english ? "03 · AI step that ran" : "03 · Paso de IA que corrió"}</span>
            <input type="text" value={step} onChange={(e) => setStep(e.target.value)} />
          </label>
          <label className="portal-field"><span>{english ? "04 · Policy applied" : "04 · Política aplicada"}</span>
            <select value={policy} onChange={(e) => setPolicy(e.target.value)}>
              {Object.entries(POLICIES).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <label className="portal-field"><span>{english ? "04 · Identity and authority context" : "04 · Contexto de identidad y autoridad"}</span>
            <textarea value={identity} onChange={(e) => setIdentity(e.target.value)} />
          </label>
          <label className="portal-field"><span>{english ? "05 · Human approver" : "05 · Aprobador humano"}</span>
            <input type="text" value={approver} onChange={(e) => setApprover(e.target.value)} />
          </label>
          <label className="portal-field"><span>{english ? "06 · Decision" : "06 · Decisión"}</span>
            <select value={decision} onChange={(e) => setDecision(e.target.value as "ALLOW" | "DENY")}>
              <option value="ALLOW">{english ? "Allowed" : "Permitido"}</option>
              <option value="DENY">{english ? "Stopped — fail-closed" : "Detenido — fail-closed"}</option>
            </select>
          </label>
          <label className="portal-field"><span>{english ? "06 · Reason for the stop (required if fail-closed)" : "06 · Motivo de la detención (obligatorio si es fail-closed)"}</span>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={english ? "A stopped record without a reason is incomplete: write the exact cause." : "Un registro detenido sin motivo está incompleto: escribe la causa exacta."} />
          </label>
          {isDeny && !reason.trim() && <p className="form-error" role="alert">{english ? "A stopped record without a reason is incomplete." : "Un registro detenido sin motivo está incompleto."}</p>}
        </div>
        <div className="doc-form-actions">
          <button type="button" className="button button-copper" onClick={copyRecord}><Copy aria-hidden="true" /> {english ? "Copy the record" : "Copiar la ficha"}</button>
          <button type="button" className="button button-outline-dark" onClick={downloadRecord}><Download aria-hidden="true" /> {english ? "Download (.md)" : "Descargar (.md)"}</button>
          <button type="button" className="button button-outline-dark" onClick={() => window.print()}><Printer aria-hidden="true" /> {english ? "Print the sheet (one A4 page)" : "Imprimir la ficha (una página A4)"}</button>
        </div>
        <p className="doc-msg" aria-live="polite">{message}</p>
        <p className="form-note">{english ? "The sheet is laid out to print on a single page from the browser: printing isolates the sheet and leaves the rest of the page out." : "La ficha está maquetada para salir en una sola página al imprimir desde el navegador: la impresión aísla la ficha y deja fuera el resto de la página."}</p>
      </div>

      <article className="audit-sheet" id="auditSheet" aria-label={english ? "TAMV Creator Intelligence audit record" : "Ficha de auditoría de TAMV Creator Intelligence"}>
        <span className="mono">TAMV Creator Intelligence · Audit Record</span>
        <h3>{english ? "Audit record" : "Registro de auditoría"}</h3>
        <p style={{ margin: "0 0 4px", color: "#5b6973", fontSize: 10 }}>{english ? "Summary for auditors and regulators above · Cryptographic detail for engineers below · Example record — official sheet format" : "Resumen para auditores y reguladores arriba · Detalle criptográfico para ingenieros abajo · Registro de ejemplo — formato oficial de la ficha"}</p>
        <p style={{ margin: 0 }}><span className={`audit-decision ${isDeny ? "deny" : "allow"}`}>{isDeny ? (english ? "STOPPED — FAIL-CLOSED" : "DETENIDO — FAIL-CLOSED") : (english ? "ALLOWED" : "PERMITIDO")}</span></p>
        <h4 style={{ margin: "14px 0 0", color: "#1c2f42", font: "700 10px/1.5 var(--mono)", letterSpacing: ".1em", textTransform: "uppercase" }}>{english ? "Record summary" : "Resumen del registro"}</h4>
        <dl>
          <dt>01 · {english ? "Record ID and date-time" : "ID de registro y fecha-hora"}</dt><dd>{meta ? `${meta.id} · ${meta.fecha}` : "—"}</dd>
          <dt>02 · {english ? "Skill package · tamv-pack" : "Paquete de skill · tamv-pack"}</dt><dd>{pack.trim() || "—"}</dd>
          <dt>02 · {english ? "Version" : "Versión"}</dt><dd>{version.trim() || "—"}</dd>
          <dt>03 · {english ? "AI step that ran" : "Paso de IA que corrió"}</dt><dd>{step.trim() || "—"}</dd>
          <dt>04 · {english ? "Policy applied" : "Política aplicada"}</dt><dd>{POLICIES[policy] ?? policy}</dd>
          <dt>04 · {english ? "Identity and authority context" : "Contexto de identidad y autoridad"}</dt><dd>{identity.trim() || "—"}</dd>
          <dt>05 · {english ? "Human approver" : "Aprobador humano"}</dt><dd>{approver.trim() || "—"}</dd>
          <dt>06 · {english ? "Decision" : "Decisión"}</dt><dd>{isDeny ? (english ? "STOPPED — FAIL-CLOSED" : "DETENIDO — FAIL-CLOSED") : (english ? "ALLOWED" : "PERMITIDO")} · {reasonText()}</dd>
        </dl>
        <h4 style={{ margin: "14px 0 0", color: "#1c2f42", font: "700 10px/1.5 var(--mono)", letterSpacing: ".1em", textTransform: "uppercase" }}>{english ? "Integrity · Engineering detail" : "Integridad · Detalle para ingeniería"}</h4>
        <dl>
          <dt>07 · {english ? "Evidence · Execution trace reference" : "Evidencia · Referencia de traza de ejecución"}</dt><dd><code>{meta?.trace ?? "—"}</code>{traceLines().map((l) => <div key={l} style={{ marginTop: 2 }}>{l}</div>)}</dd>
          <dt>08 · SHA-512 {english ? "digest of the canonical record" : "Digest SHA-512 del registro canónico"}</dt><dd><code>{digest === "—" ? digest : grouped(digest)}</code></dd>
          <dt>08 · Ed25519 {english ? "signature" : "firma"}</dt><dd><code>{edAvailable ? (signature === "—" ? signature : grouped(signature)) : (english ? "— no signature in this demonstration —" : "— sin firma en esta demostración —")}</code></dd>
          <dt>08 · Ed25519 {english ? "signature verification" : "verificación de firma"}</dt><dd>{edAvailable ? (verify === "VÁLIDA" ? <><span style={{ color: "#2f6b4a", fontWeight: 700 }}>✓ {english ? "VALID" : "VÁLIDA"}</span>{` — ${english ? "the signature matches this record and the demonstration session's public key" : "la firma corresponde a este registro y a la clave pública de la sesión de demostración"}${pubHex ? ` (${english ? "fingerprint" : "huella"}: ${pubHex.slice(0, 32)}…).` : ""}`}</> : verify === "NO VÁLIDA" ? <span style={{ color: "#7c3028", fontWeight: 700 }}>✕ {english ? "NOT VALID" : "NO VÁLIDA"}</span> : verify) : (english ? "Ed25519 signature is not available in this browser — the field is recorded and verification runs in the issuing runtime." : "Firma Ed25519 no disponible en este navegador — el campo queda registrado y la verificación se ejecuta en el runtime emisor.")}</dd>
        </dl>
        <p className="audit-foot">{english ? "Guiding TAMV principle: evidence precedes the claim; human authority remains above computational capability." : "Principio rector TAMV: la evidencia precede al claim; la autoridad humana permanece por encima de la capacidad computacional."} {english ? "One-page record." : "Ficha de una página."}</p>
      </article>
      <p className="form-note">{english ? "The sheet keeps its official Spanish record format; the interface around it is bilingual." : "La ficha conserva su formato oficial de registro en español; la interfaz que la rodea es bilingüe."}</p>
    </div>
  )
}
