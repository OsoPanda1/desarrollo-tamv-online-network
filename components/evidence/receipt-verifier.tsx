"use client"

import { useRef, useState } from "react"
import { AlertTriangle, CheckCircle2, FileSearch, Loader2, ShieldCheck, XCircle } from "lucide-react"

import {
  RECEIPT_LEVELS,
  RECEIPT_SEMANTICS,
  RECEIPT_SEMANTICS_ES,
  shortDigest,
  verifyEvidenceFiles,
  verifyReceipt,
  type EvidenceBindingResult,
  type EvidenceReceipt,
  type ReceiptVerification,
} from "@/lib/evidence/receipt"

type VerifierState = {
  verification: ReceiptVerification | null
  receipt: EvidenceReceipt | null
  binding: EvidenceBindingResult | null
}

const emptyState: VerifierState = { verification: null, receipt: null, binding: null }

export function ReceiptVerifier({ locale = "es" }: { locale?: "es" | "en" }) {
  const es = locale === "es"
  const [text, setText] = useState("")
  const [state, setState] = useState<VerifierState>(emptyState)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const jsonInput = useRef<HTMLInputElement>(null)
  const evidenceInput = useRef<HTMLInputElement>(null)

  async function verifyText(value: string) {
    setError("")
    setState(emptyState)
    if (!value.trim()) {
      setError(es ? "Pega un comprobante JSON o carga un archivo." : "Paste a JSON receipt or load a file.")
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(value)
    } catch {
      setError(es ? "El texto no es JSON válido." : "The text is not valid JSON.")
      return
    }

    setBusy(true)
    try {
      const verification = await verifyReceipt(parsed)
      setState({
        verification,
        receipt: verification.levels.shape ? (parsed as EvidenceReceipt) : null,
        binding: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleJsonFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (file.size > 256 * 1024) {
      setError(es ? "El archivo es demasiado grande para un comprobante." : "The file is too large for a receipt.")
      return
    }
    const value = (await file.text()).replace(/^\uFEFF/, "")
    setText(value)
    await verifyText(value)
  }

  async function handleEvidenceFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (!state.receipt || !files.length) return

    setBusy(true)
    try {
      const binding = await verifyEvidenceFiles(
        state.receipt,
        await Promise.all(
          files.map(async (file) => ({ name: file.name, bytes: await file.arrayBuffer() })),
        ),
      )
      setState((current) => ({ ...current, binding }))
    } finally {
      setBusy(false)
    }
  }

  const verification = state.verification
  const binding = state.binding
  const integrity = Boolean(verification?.valid)
  const bindingMatched = Boolean(binding && binding.matched.length > 0)

  return (
    <div className="cev-verifier">
      <div className="cev-verifier-input">
        <label className="cev-field">
          <span>{es ? "Comprobante JSON" : "Receipt JSON"}</span>
          <textarea
            value={text}
            rows={9}
            spellCheck={false}
            onChange={(event) => setText(event.target.value)}
            placeholder={'{\n  "schema": "tamv.evidence_receipt.v1",\n  …\n}'}
          />
        </label>
        <div className="cev-actions">
          <button type="button" className="button button-copper" onClick={() => verifyText(text)} disabled={busy}>
            {busy ? <Loader2 className="cev-spin" aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
            {es ? "Verificar" : "Verify"}
          </button>
          <input
            ref={jsonInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={handleJsonFile}
          />
          <button type="button" className="button button-outline-dark" onClick={() => jsonInput.current?.click()}>
            <FileSearch aria-hidden="true" />
            {es ? "Cargar archivo" : "Load file"}
          </button>
        </div>
      </div>

      {error && (
        <p className="cev-status cev-status-error" role="alert">
          <AlertTriangle aria-hidden="true" /> {error}
        </p>
      )}

      {verification && (
        <div className="cev-verifier-result" aria-live="polite">
          <div className={`cev-verdict ${integrity ? "is-valid" : "is-invalid"}`}>
            {integrity ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
            <div>
              <strong>
                {integrity
                  ? es
                    ? "Forma e integridad correctas"
                    : "Shape and integrity hold"
                  : es
                    ? "Verificación no superada"
                    : "Verification failed"}
              </strong>
              <span>
                {integrity
                  ? es
                    ? "El payload canónico coincide con el hash declarado. Los niveles superiores siguen sin comprobarse."
                    : "The canonical payload matches the declared hash. Higher levels remain unchecked."
                  : verification.levels.shape
                    ? es
                      ? "El esquema es válido, pero el hash no coincide."
                      : "The schema is valid, but the hash does not match."
                    : es
                      ? "El JSON no cumple el esquema estricto."
                      : "The JSON does not match the strict schema."
                }
              </span>
            </div>
          </div>

          <dl className="cev-facts">
            <div>
              <dt>{es ? "Hash declarado" : "Declared hash"}</dt>
              <dd><code>{verification.expected ? shortDigest(verification.expected) : "—"}</code></dd>
            </div>
            <div>
              <dt>{es ? "Hash recalculado" : "Recomputed hash"}</dt>
              <dd><code>{verification.actual ? shortDigest(verification.actual) : "—"}</code></dd>
            </div>
            <div>
              <dt>{es ? "Sujeto" : "Subject"}</dt>
              <dd>{state.receipt?.subject.title ?? "—"}</dd>
            </div>
            <div>
              <dt>{es ? "Huellas declaradas" : "Declared digests"}</dt>
              <dd>{state.receipt?.evidence.length ?? 0}</dd>
            </div>
          </dl>

          {verification.issues.length > 0 && (
            <ul className="cev-issue-list">
              {verification.issues.slice(0, 8).map((issue, index) => (
                <li key={`${issue.path}-${index}`}>
                  <code>{issue.path || "payload"}</code> · {issue.code}: {issue.message}
                </li>
              ))}
            </ul>
          )}

          {state.receipt && (
            <div className="cev-binding">
              <div>
                <p className="eyebrow">{es ? "NIVEL 3 / VÍNCULO" : "LEVEL 3 / BINDING"}</p>
                <h4>{es ? "Comprueba los bytes, no solo el JSON" : "Check the bytes, not only the JSON"}</h4>
                <p>
                  {es
                    ? "Selecciona el archivo original. El navegador recalcula su SHA-256 y lo compara con las huellas declaradas. Nada se sube."
                    : "Select the original file. The browser recomputes its SHA-256 and compares it with the declared digests. Nothing is uploaded."}
                </p>
              </div>
              <input
                ref={evidenceInput}
                className="sr-only"
                type="file"
                multiple
                onChange={handleEvidenceFiles}
              />
              <button type="button" className="button button-outline-dark" onClick={() => evidenceInput.current?.click()}>
                <FileSearch aria-hidden="true" />
                {es ? "Comprobar archivos" : "Check files"}
              </button>
            </div>
          )}

          {binding && (
            <div className={`cev-binding-result ${bindingMatched ? "is-valid" : "is-invalid"}`}>
              <strong>
                {bindingMatched
                  ? es
                    ? `${binding.matched.length} archivo(s) coinciden con una huella declarada.`
                    : `${binding.matched.length} file(s) match a declared digest.`
                  : es
                    ? "Ningún archivo coincide con las huellas declaradas."
                    : "No file matches the declared digests."}
              </strong>
              <ul>
                {binding.matched.map((item) => (
                  <li key={`${item.sha256}-${item.fileName}`}>
                    <CheckCircle2 aria-hidden="true" /> {item.fileName} → {item.label}
                  </li>
                ))}
                {binding.unmatchedFiles.map((item) => (
                  <li key={`${item.sha256}-${item.fileName}`}>
                    <XCircle aria-hidden="true" /> {item.fileName} · sha256:{shortDigest(item.sha256, 10, 6)}
                  </li>
                ))}
                {binding.unmatchedEvidence.map((item) => (
                  <li key={item.sha256}>
                    <AlertTriangle aria-hidden="true" /> {es ? "Sin archivo para" : "No file for"} {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="cev-levels">
            {RECEIPT_LEVELS.map((level) => {
              const reached =
                level.id === "shape"
                  ? verification.levels.shape
                  : level.id === "integrity"
                    ? verification.levels.integrity
                    : level.id === "binding"
                      ? bindingMatched
                      : false
              return (
                <article key={level.id} className={reached ? "is-reached" : ""}>
                  <span>{reached ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}</span>
                  <div>
                    <strong>{es ? level.labelEs : level.labelEn}</strong>
                    <p>{es ? level.descriptionEs : level.descriptionEn}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="cev-semantics">{es ? RECEIPT_SEMANTICS_ES : RECEIPT_SEMANTICS}</p>
        </div>
      )}
    </div>
  )
}
