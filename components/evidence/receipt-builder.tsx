"use client"

import { useRef, useState } from "react"
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  Download,
  FileCheck2,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import {
  MAX_EVIDENCE_FILES,
  MAX_EVIDENCE_FILE_BYTES,
  RECEIPT_SCHEMA,
  RECEIPT_TERMS_VERSION,
  RECEIPT_TOOL,
  RECEIPT_VERSION,
  receiptFileName,
  sha256Hex,
  shortDigest,
  stampReceipt,
  verifyReceipt,
  type EvidenceReceipt,
  type ReceiptEvidenceItem,
} from "@/lib/evidence/receipt"

type Status = { tone: "idle" | "ok" | "error" | "info"; text: string }

const subjectKinds = [
  { value: "build", es: "Build o aplicación", en: "Build or application" },
  { value: "repository", es: "Repositorio", en: "Repository" },
  { value: "dataset", es: "Conjunto de datos", en: "Dataset" },
  { value: "publication", es: "Publicación", en: "Publication" },
  { value: "proposal", es: "Propuesta", en: "Proposal" },
  { value: "simulation", es: "Simulación", en: "Simulation" },
  { value: "service", es: "Servicio", en: "Service" },
  { value: "other", es: "Otro", en: "Other" },
] as const

function randomHex(bytes = 16) {
  const values = crypto.getRandomValues(new Uint8Array(bytes))
  return [...values].map((value) => value.toString(16).padStart(2, "0")).join("")
}

function formatBytes(value: number | null) {
  if (value === null) return "—"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function evidenceKind(contentType: string): ReceiptEvidenceItem["kind"] {
  if (contentType.startsWith("image/")) return "image"
  if (contentType.startsWith("video/")) return "video"
  if (contentType.includes("json") || contentType.includes("csv") || contentType.includes("xml")) return "dataset"
  if (contentType.startsWith("text/") || contentType.includes("pdf")) return "document"
  return "file"
}

function splitUrls(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function ReceiptBuilder({ locale = "es" }: { locale?: "es" | "en" }) {
  const es = locale === "es"
  const [title, setTitle] = useState("")
  const [kind, setKind] = useState<(typeof subjectKinds)[number]["value"]>("build")
  const [context, setContext] = useState("")
  const [description, setDescription] = useState("")
  const [urls, setUrls] = useState("")
  const [claims, setClaims] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [github, setGithub] = useState("")
  const [xHandle, setXHandle] = useState("")
  const [farcaster, setFarcaster] = useState("")
  const [license, setLicense] = useState("")
  const [evidence, setEvidence] = useState<ReceiptEvidenceItem[]>([])
  const [shareEvidence, setShareEvidence] = useState(false)
  const [publishReceipt, setPublishReceipt] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [receipt, setReceipt] = useState<EvidenceReceipt | null>(null)
  const [previousHash, setPreviousHash] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>({
    tone: "idle",
    text: es
      ? "Completa los datos declarados y adjunta al menos una huella o una URL pública."
      : "Fill in the declared fields and attach at least one digest or public URL.",
  })
  const fileInput = useRef<HTMLInputElement>(null)

  function markDirty() {
    setDirty(true)
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!files.length) return

    if (evidence.length + files.length > MAX_EVIDENCE_FILES) {
      setStatus({
        tone: "error",
        text: es
          ? `Puedes adjuntar como máximo ${MAX_EVIDENCE_FILES} archivos.`
          : `You can attach at most ${MAX_EVIDENCE_FILES} files.`,
      })
      return
    }

    setBusy(true)
    const next = [...evidence]
    const skipped: string[] = []

    for (const file of files) {
      if (file.size > MAX_EVIDENCE_FILE_BYTES) {
        skipped.push(file.name)
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const digest = await sha256Hex(bytes)
      next.push({
        label: Array.from(file.name.normalize("NFC")).slice(0, 160).join(""),
        kind: evidenceKind(file.type || ""),
        sha256: digest,
        sizeBytes: file.size,
        contentType: file.type || null,
        uri: null,
        license: license.trim() || null,
      })
    }

    setEvidence(next)
    markDirty()
    setBusy(false)
    setStatus({
      tone: skipped.length ? "error" : "ok",
      text: skipped.length
        ? es
          ? `Se omitieron archivos de más de ${formatBytes(MAX_EVIDENCE_FILE_BYTES)}: ${skipped.join(", ")}.`
          : `Files larger than ${formatBytes(MAX_EVIDENCE_FILE_BYTES)} were skipped: ${skipped.join(", ")}.`
        : es
          ? "Huellas calculadas localmente. Los archivos no se subieron ni se guardaron."
          : "Digests computed locally. The files were not uploaded or stored.",
    })
  }

  function removeEvidence(index: number) {
    setEvidence((current) => current.filter((_, position) => position !== index))
    markDirty()
  }

  async function handleStamp() {
    if (!accepted) {
      setStatus({
        tone: "error",
        text: es
          ? "Confirma que entiendes los límites del comprobante antes de sellarlo."
          : "Confirm that you understand the receipt limits before stamping.",
      })
      return
    }

    const urlList = splitUrls(urls)
    if (!title.trim()) {
      setStatus({ tone: "error", text: es ? "El título del sujeto es obligatorio." : "The subject title is required." })
      return
    }
    if (!evidence.length && !urlList.length) {
      setStatus({
        tone: "error",
        text: es
          ? "Adjunta al menos un archivo o una URL pública; un comprobante vacío no vincula nada."
          : "Attach at least one file or public URL; an empty receipt binds nothing.",
      })
      return
    }

    setBusy(true)
    try {
      const now = new Date().toISOString()
      const handles: EvidenceReceipt["issuer"]["handles"] = []
      if (github.trim()) handles.push({ platform: "github", handle: github.trim().replace(/^@/, "") })
      if (xHandle.trim()) handles.push({ platform: "x", handle: xHandle.trim().replace(/^@/, "") })
      if (farcaster.trim()) handles.push({ platform: "farcaster", handle: farcaster.trim().replace(/^@/, "") })

      const claimList = claims
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20)
        .map((statement) => ({ statement, status: "declared" as const }))

      const stamped = await stampReceipt({
        schema: RECEIPT_SCHEMA,
        createdAt: now,
        nonce: randomHex(16),
        producer: {
          name: "TAMV Online Network",
          url: "https://tamv.online",
          tool: RECEIPT_TOOL,
          version: RECEIPT_VERSION,
        },
        purpose: {
          primary: "portable_evidence_receipt",
          context: context.trim() || null,
          note: es
            ? "Comprobante creado en el módulo de desarrollador independiente. Todos los datos son declarados por el emisor."
            : "Receipt created in the independent developer module. All data is declared by the issuer.",
        },
        issuer: {
          kind: "self_declared",
          displayName: displayName.trim() || null,
          handles,
        },
        subject: {
          kind,
          title: title.trim(),
          description: description.trim() || null,
          urls: urlList,
        },
        evidence,
        claims: claimList,
        consent: {
          shareEvidence,
          publishReceipt,
          termsVersion: RECEIPT_TERMS_VERSION,
          grantedAt: now,
        },
        chain: { previous: previousHash },
      })

      setReceipt(stamped)
      setPreviousHash(stamped.hash.value)
      setDirty(false)
      setCopied(false)
      setStatus({
        tone: "ok",
        text: es
          ? "Comprobante sellado. Copia el JSON y compártelo junto con el archivo si tu revisión lo requiere."
          : "Receipt stamped. Copy the JSON and share it with the file if your review requires it.",
      })
    } catch (error) {
      setStatus({
        tone: "error",
        text: es
          ? `No se pudo sellar: ${error instanceof Error ? error.message : "error desconocido"}.`
          : `Could not stamp: ${error instanceof Error ? error.message : "unknown error"}.`,
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify() {
    if (!receipt) {
      setStatus({ tone: "error", text: es ? "Primero sella un comprobante." : "Stamp a receipt first." })
      return
    }
    const result = await verifyReceipt(receipt)
    setStatus({
      tone: result.valid ? "ok" : "error",
      text: result.valid
        ? es
          ? "Integridad correcta: el payload canónico sigue coincidiendo con el hash. Esto no prueba autoría ni veracidad."
          : "Integrity holds: the canonical payload still matches the hash. This does not prove authorship or truth."
        : es
          ? "El comprobante no coincide con su hash. Algo cambió después de sellarlo."
          : "The receipt does not match its hash. Something changed after stamping.",
    })
  }

  async function copyJson() {
    if (!receipt) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(receipt, null, 2))
      setCopied(true)
      setStatus({ tone: "ok", text: es ? "JSON copiado." : "JSON copied." })
    } catch {
      setStatus({ tone: "error", text: es ? "El navegador no permitió copiar." : "The browser blocked copying." })
    }
  }

  function downloadJson() {
    if (!receipt) return
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = receiptFileName(receipt.subject.title)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setStatus({ tone: "ok", text: es ? "Archivo JSON descargado." : "JSON file downloaded." })
  }

  const digest = receipt ? shortDigest(receipt.hash.value) : null

  return (
    <div className="cev-builder">
      <div className="cev-builder-grid">
        <section className="cev-panel" aria-labelledby="cev-subject-title">
          <header className="cev-panel-head">
            <p className="eyebrow">01 / {es ? "SUJETO" : "SUBJECT"}</p>
            <h3 id="cev-subject-title">{es ? "¿Qué estás evidenciando?" : "What are you evidencing?"}</h3>
            <p>
              {es
                ? "Describe el artefacto, no una promesa. Una URL pública y una huella de archivo son localizadores distintos."
                : "Describe the artefact, not a promise. A public URL and a file digest are different locators."}
            </p>
          </header>

          <div className="cev-field-grid">
            <label className="cev-field cev-field-wide">
              <span>{es ? "Título" : "Title"} *</span>
              <input
                value={title}
                maxLength={180}
                onChange={(event) => {
                  setTitle(event.target.value)
                  markDirty()
                }}
                placeholder={es ? "Módulo de evidencia para desarrolladores" : "Developer evidence module"}
              />
            </label>
            <label className="cev-field">
              <span>{es ? "Tipo" : "Kind"}</span>
              <select
                value={kind}
                onChange={(event) => {
                  setKind(event.target.value as typeof kind)
                  markDirty()
                }}
              >
                {subjectKinds.map((item) => (
                  <option key={item.value} value={item.value}>
                    {es ? item.es : item.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="cev-field">
              <span>{es ? "Contexto" : "Context"}</span>
              <input
                value={context}
                maxLength={200}
                onChange={(event) => {
                  setContext(event.target.value)
                  markDirty()
                }}
                placeholder={es ? "Reto, convocatoria o revisión" : "Challenge, call, or review"}
              />
            </label>
            <label className="cev-field cev-field-wide">
              <span>{es ? "Descripción" : "Description"}</span>
              <textarea
                value={description}
                maxLength={1200}
                rows={3}
                onChange={(event) => {
                  setDescription(event.target.value)
                  markDirty()
                }}
                placeholder={es ? "Alcance acotado y resultado reproducible." : "Focused scope and reproducible result."}
              />
            </label>
            <label className="cev-field cev-field-wide">
              <span>{es ? "URLs públicas (una por línea)" : "Public URLs (one per line)"}</span>
              <textarea
                value={urls}
                rows={2}
                onChange={(event) => {
                  setUrls(event.target.value)
                  markDirty()
                }}
                placeholder="https://github.com/usuario/repositorio/commit/…"
              />
            </label>
            <label className="cev-field cev-field-wide">
              <span>{es ? "Afirmaciones declaradas (una por línea)" : "Declared claims (one per line)"}</span>
              <textarea
                value={claims}
                rows={3}
                onChange={(event) => {
                  setClaims(event.target.value)
                  markDirty()
                }}
                placeholder={
                  es
                    ? "El build está publicado en la URL indicada.\nLa prueba se ejecutó con el comando documentado."
                    : "The build is published at the stated URL.\nThe test ran with the documented command."
                }
              />
            </label>
          </div>
        </section>

        <section className="cev-panel" aria-labelledby="cev-evidence-title">
          <header className="cev-panel-head">
            <p className="eyebrow">02 / {es ? "EVIDENCIA" : "EVIDENCE"}</p>
            <h3 id="cev-evidence-title">{es ? "Huellas locales, sin subida" : "Local digests, no upload"}</h3>
            <p>
              {es
                ? "El navegador calcula SHA-256. El archivo permanece en tu dispositivo; solo su huella entra al comprobante."
                : "The browser computes SHA-256. The file stays on your device; only its digest enters the receipt."}
            </p>
          </header>

          <div className="cev-upload">
            <input
              ref={fileInput}
              id="cev-evidence-files"
              className="sr-only"
              type="file"
              multiple
              onChange={handleFiles}
            />
            <button
              type="button"
              className="button button-outline-dark"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              <FileCheck2 aria-hidden="true" />
              {es ? "Elegir archivos" : "Choose files"}
            </button>
            <span>
              {es
                ? `Hasta ${MAX_EVIDENCE_FILES} archivos · ${formatBytes(MAX_EVIDENCE_FILE_BYTES)} por archivo`
                : `Up to ${MAX_EVIDENCE_FILES} files · ${formatBytes(MAX_EVIDENCE_FILE_BYTES)} each`}
            </span>
          </div>

          <label className="cev-field">
            <span>{es ? "Licencia declarada para estos archivos" : "Declared license for these files"}</span>
            <input
              value={license}
              maxLength={160}
              onChange={(event) => {
                const value = event.target.value
                setLicense(value)
                setEvidence((current) =>
                  current.map((item) => ({ ...item, license: value.trim() || null })),
                )
                markDirty()
              }}
              placeholder={es ? "CC-BY-4.0, MIT, uso privado…" : "CC-BY-4.0, MIT, private use…"}
            />
          </label>

          {evidence.length === 0 ? (
            <p className="cev-empty">
              {es
                ? "Todavía no hay huellas. También puedes sellar solo con una URL pública, pero el vínculo será más débil."
                : "No digests yet. You can also stamp with only a public URL, but the binding is weaker."}
            </p>
          ) : (
            <ul className="cev-evidence-list">
              {evidence.map((item, index) => (
                <li key={`${item.sha256}-${index}`}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>
                      {item.kind} · {formatBytes(item.sizeBytes)} · sha256:{shortDigest(item.sha256, 12, 8)}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={es ? `Quitar ${item.label}` : `Remove ${item.label}`}
                    onClick={() => removeEvidence(index)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cev-panel" aria-labelledby="cev-issuer-title">
          <header className="cev-panel-head">
            <p className="eyebrow">03 / {es ? "EMISOR" : "ISSUER"}</p>
            <h3 id="cev-issuer-title">{es ? "Identidad declarada" : "Declared identity"}</h3>
            <p>
              {es
                ? "Sin sesión, la identidad es auto-declarada. No se verifica ni se convierte en propiedad del artefacto."
                : "Without a session, identity is self-declared. It is not verified and does not become ownership of the artefact."}
            </p>
          </header>

          <div className="cev-field-grid">
            <label className="cev-field cev-field-wide">
              <span>{es ? "Nombre visible" : "Display name"}</span>
              <input
                value={displayName}
                maxLength={120}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                  markDirty()
                }}
                placeholder={es ? "Tu nombre o alias" : "Your name or alias"}
              />
            </label>
            <label className="cev-field">
              <span>GitHub</span>
              <input
                value={github}
                maxLength={120}
                onChange={(event) => {
                  setGithub(event.target.value)
                  markDirty()
                }}
                placeholder="usuario"
              />
            </label>
            <label className="cev-field">
              <span>X</span>
              <input
                value={xHandle}
                maxLength={120}
                onChange={(event) => {
                  setXHandle(event.target.value)
                  markDirty()
                }}
                placeholder="usuario"
              />
            </label>
            <label className="cev-field">
              <span>Farcaster</span>
              <input
                value={farcaster}
                maxLength={120}
                onChange={(event) => {
                  setFarcaster(event.target.value)
                  markDirty()
                }}
                placeholder="usuario"
              />
            </label>
          </div>
        </section>

        <section className="cev-panel cev-consent" aria-labelledby="cev-consent-title">
          <header className="cev-panel-head">
            <p className="eyebrow">04 / {es ? "CONSENTIMIENTO" : "CONSENT"}</p>
            <h3 id="cev-consent-title">{es ? "Decide qué se comparte" : "Decide what is shared"}</h3>
          </header>

          <label className="cev-check">
            <input
              type="checkbox"
              checked={shareEvidence}
              onChange={(event) => {
                setShareEvidence(event.target.checked)
                markDirty()
              }}
            />
            <span>
              {es
                ? "Autorizo compartir las huellas y metadatos de evidencia incluidos en este comprobante."
                : "I authorise sharing the evidence digests and metadata included in this receipt."}
            </span>
          </label>
          <label className="cev-check">
            <input
              type="checkbox"
              checked={publishReceipt}
              onChange={(event) => {
                setPublishReceipt(event.target.checked)
                markDirty()
              }}
            />
            <span>
              {es
                ? "Autorizo publicar el comprobante completo si se registra en TAMV en una fase posterior."
                : "I authorise publishing the full receipt if it is registered in TAMV in a later phase."}
            </span>
          </label>
          <label className="cev-check cev-check-strong">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>
              {es
                ? "Entiendo que este comprobante declara datos y una huella; no prueba autoría, propiedad, veracidad, finalización, revisión ni derecho a pago."
                : "I understand this receipt declares data and a digest; it does not prove authorship, ownership, truth, completion, review, or a right to payment."}
            </span>
          </label>

          <div className="cev-actions">
            <button type="button" className="button button-copper" onClick={handleStamp} disabled={busy || !accepted}>
              {busy ? <Loader2 className="cev-spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
              {es ? "Sellar comprobante" : "Stamp receipt"}
            </button>
            {dirty && receipt && (
              <span className="cev-dirty">
                <AlertTriangle aria-hidden="true" />
                {es ? "Hay cambios sin sellar." : "There are unstamped changes."}
              </span>
            )}
          </div>
        </section>
      </div>

      <p className={`cev-status cev-status-${status.tone}`} role="status" aria-live="polite">
        {status.text}
      </p>

      {receipt && (
        <section className="cev-result" aria-labelledby="cev-result-title">
          <header className="cev-result-head">
            <div>
              <p className="eyebrow">05 / {es ? "RESULTADO" : "RESULT"}</p>
              <h3 id="cev-result-title">{es ? "Comprobante sellado" : "Stamped receipt"}</h3>
              <p>
                <code>sha256:{digest}</code>
              </p>
            </div>
            <span className="cev-seal">{es ? "SELLADO" : "STAMPED"}</span>
          </header>

          <dl className="cev-facts">
            <div>
              <dt>{es ? "Sujeto" : "Subject"}</dt>
              <dd>{receipt.subject.title}</dd>
            </div>
            <div>
              <dt>{es ? "Huellas" : "Digests"}</dt>
              <dd>{receipt.evidence.length}</dd>
            </div>
            <div>
              <dt>{es ? "Afirmaciones" : "Claims"}</dt>
              <dd>{receipt.claims.length}</dd>
            </div>
            <div>
              <dt>{es ? "Hash completo" : "Full hash"}</dt>
              <dd><code>{receipt.hash.value}</code></dd>
            </div>
          </dl>

          <pre className="cev-json" tabIndex={0}>{JSON.stringify(receipt, null, 2)}</pre>

          <div className="cev-actions">
            <button type="button" className="button button-copper" onClick={copyJson}>
              {copied ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />}
              {copied ? (es ? "Copiado" : "Copied") : es ? "Copiar JSON" : "Copy JSON"}
            </button>
            <button type="button" className="button button-outline-dark" onClick={downloadJson}>
              <Download aria-hidden="true" />
              {es ? "Descargar JSON" : "Download JSON"}
            </button>
            <button type="button" className="button button-outline-dark" onClick={handleVerify}>
              <ShieldCheck aria-hidden="true" />
              {es ? "Verificar integridad" : "Verify integrity"}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
