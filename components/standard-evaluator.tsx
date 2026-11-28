"use client"

import { useState } from "react"
import { AlertTriangle, Check, Clipboard, Loader2, Play, RotateCcw } from "lucide-react"
import {
  PILLARS,
  STANDARD_LEVELS,
  validateAndEvaluate,
  type CheckStatus,
  type EvaluationReport,
  type PillarId,
  type ValidationIssue,
} from "@/lib/standard"
import type { Locale } from "@/lib/i18n"

const OUTCOME_LABEL: Record<EvaluationReport["outcome"], [string, string]> = {
  complete: ["Completa", "Complete"],
  conditional: ["Condicional", "Conditional"],
  blocked: ["Bloqueada", "Blocked"],
}

const STATUS_LABEL: Record<CheckStatus, [string, string]> = {
  pass: ["Cumple", "Pass"],
  warn: ["Advertencia", "Warning"],
  fail: ["Fallo", "Fail"],
  not_applicable: ["No aplica", "Not applicable"],
}

const EVIDENCE_LABEL: Record<string, [string, string]> = {
  declared: ["Declarado", "Declared"],
  documented: ["Documentado", "Documented"],
  attested: ["Atestiguado", "Attested"],
  verified: ["Verificado (reservado)", "Verified (reserved)"],
}

function pillClass(status: CheckStatus) {
  return `etia-pill etia-pill-${status.replaceAll("_", "-")}`
}

export function StandardEvaluator({ locale }: { locale: Locale }) {
  const english = locale === "en"
  const [text, setText] = useState("")
  const [report, setReport] = useState<EvaluationReport | null>(null)
  const [issues, setIssues] = useState<ValidationIssue[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [openPillar, setOpenPillar] = useState<PillarId | null>("classification")

  async function loadExample() {
    setError(null)
    try {
      const response = await fetch("/standards/example-declaration.json", { cache: "no-store" })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setText(await response.text())
      setIssues(null)
      setReport(null)
    } catch {
      setError(
        english
          ? "The example declaration could not be loaded. Paste a declaration manually."
          : "No se pudo cargar la declaración de ejemplo. Pega una declaración manualmente.",
      )
    }
  }

  async function evaluate() {
    setBusy(true)
    setError(null)
    setIssues(null)
    setReport(null)
    setCopied(false)
    try {
      const parsed: unknown = JSON.parse(text)
      const result = await validateAndEvaluate(parsed, { referenceDate: new Date().toISOString() })
      if (result.ok) {
        setReport(result.report)
        setOpenPillar("classification")
      } else {
        setIssues(result.issues)
      }
    } catch (caught) {
      setError(
        caught instanceof SyntaxError
          ? english
            ? "The text is not valid JSON."
            : "El texto no es JSON válido."
          : english
            ? "Evaluation failed in this browser. Web Crypto is required."
            : "La evaluación falló en este navegador. Se requiere Web Crypto.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function copyDigest() {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report.digest)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const checksByPillar = report
    ? PILLARS.map((pillar) => ({
        pillar,
        summary: report.pillars.find((entry) => entry.pillar === pillar.id),
        checks: report.checks.filter((entry) => entry.pillar === pillar.id),
      }))
    : []

  return (
    <div className="etia-evaluator">
      <div className="etia-editor">
        <div className="etia-editor-head">
          <label htmlFor="etia-declaration">
            {english ? "Declaration (JSON)" : "Declaración (JSON)"}
          </label>
          <div className="etia-editor-actions">
            <button type="button" className="button button-outline-dark" onClick={loadExample}>
              <RotateCcw aria-hidden="true" /> {english ? "Load example" : "Cargar ejemplo"}
            </button>
            <button
              type="button"
              className="button button-copper"
              onClick={evaluate}
              disabled={busy || text.trim().length === 0}
            >
              {busy ? <Loader2 aria-hidden="true" className="etia-spin" /> : <Play aria-hidden="true" />}
              {english ? "Evaluate" : "Evaluar"}
            </button>
          </div>
        </div>
        <textarea
          id="etia-declaration"
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          rows={16}
          placeholder={english ? "Paste a tamv.open_integrity.declaration.v1 JSON document." : "Pega un documento JSON tamv.open_integrity.declaration.v1."}
        />
        <p className="etia-editor-note">
          {english
            ? "Evaluation runs in your browser. Nothing is uploaded from this page. The API endpoint is separate and also does not store the declaration."
            : "La evaluación se ejecuta en tu navegador. Esta página no sube nada. El endpoint de API es independiente y tampoco almacena la declaración."}
        </p>
      </div>

      {error && (
        <p className="etia-alert" role="alert">
          <AlertTriangle aria-hidden="true" /> {error}
        </p>
      )}

      {issues && (
        <div className="etia-issues" role="alert">
          <h3>{english ? "Schema issues" : "Problemas de esquema"}</h3>
          <ul>
            {issues.map((issue) => (
              <li key={`${issue.path}-${issue.code}-${issue.message}`}>
                <code>{issue.path || "(root)"}</code> — {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {report && (
        <div className="etia-report" aria-live="polite">
          <div className="etia-summary">
            <div className={`etia-outcome etia-outcome-${report.outcome}`}>
              <span>{english ? "Outcome" : "Resultado"}</span>
              <strong>{OUTCOME_LABEL[report.outcome][english ? 1 : 0]}</strong>
            </div>
            <div>
              <span>{english ? "Verification" : "Verificación"}</span>
              <strong>{report.verification}</strong>
            </div>
            <div>
              <span>{english ? "Evidence ceiling" : "Techo de evidencia"}</span>
              <strong>{EVIDENCE_LABEL[report.evidenceCeiling][english ? 1 : 0]}</strong>
            </div>
            <div className="etia-digest">
              <span>{english ? "Report digest" : "Digest del informe"}</span>
              <strong title={report.digest}>{report.digest.slice(0, 27)}…</strong>
              <button type="button" className="etia-copy" onClick={copyDigest}>
                {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                {copied ? (english ? "Copied" : "Copiado") : english ? "Copy" : "Copiar"}
              </button>
            </div>
          </div>

          <p className="etia-outcome-meaning">
            {english ? report.outcomeMeaningEn : report.outcomeMeaningEs}
          </p>

          <div className="etia-pillar-bar" aria-hidden="true">
            {report.pillars.map((pillar) => (
              <span
                key={pillar.pillar}
                className={`etia-pillar-segment etia-segment-${pillar.status}`}
                style={{ flexGrow: Math.max(pillar.total, 1) }}
                title={`${pillar.pillar}: ${pillar.status}`}
              />
            ))}
          </div>

          <div className="etia-pillars">
            {checksByPillar.map(({ pillar, summary, checks }) => (
              <section key={pillar.id} className="etia-pillar">
                <button
                  type="button"
                  className="etia-pillar-head"
                  onClick={() => setOpenPillar(openPillar === pillar.id ? null : pillar.id)}
                  aria-expanded={openPillar === pillar.id}
                >
                  <span>
                    <strong>{english ? pillar.nameEn : pillar.nameEs}</strong>
                    <em>{english ? pillar.purposeEn : pillar.purposeEs}</em>
                  </span>
                  <span className={`etia-pillar-status etia-segment-${summary?.status ?? "complete"}`}>
                    {summary
                      ? `${summary.passed}/${summary.total} · ${summary.failed > 0 ? `${summary.failed} fail` : summary.warnings > 0 ? `${summary.warnings} warn` : english ? "ok" : "ok"}`
                      : ""}
                  </span>
                </button>
                {openPillar === pillar.id && (
                  <ul className="etia-checks">
                    {checks.map((entry) => (
                      <li key={entry.id} className="etia-check">
                        <div className="etia-check-head">
                          <span className={pillClass(entry.status)}>
                            {STATUS_LABEL[entry.status][english ? 1 : 0]}
                          </span>
                          <strong>{english ? entry.titleEn : entry.titleEs}</strong>
                          <code>{entry.id}</code>
                        </div>
                        <p>{english ? entry.detailEn : entry.detailEs}</p>
                        {(entry.status === "fail" || entry.status === "warn") && entry.remediationEs && (
                          <p className="etia-remediation">
                            <AlertTriangle aria-hidden="true" />
                            {english ? entry.remediationEn : entry.remediationEs}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <details className="etia-claims">
            <summary>
              {english ? "Certification claims assessed" : "Afirmaciones de certificación evaluadas"} (
              {report.claimAssessments.length})
            </summary>
            {report.claimAssessments.length === 0 ? (
              <p>{english ? "No certification claims were declared." : "No se declararon afirmaciones de certificación."}</p>
            ) : (
              <ul>
                {report.claimAssessments.map((claim) => (
                  <li key={claim.id}>
                    <code>{claim.id}</code> · {claim.claimType} · {claim.declaredStatus} ·{" "}
                    {english ? "evidence" : "evidencia"}: {EVIDENCE_LABEL[claim.evidence][english ? 1 : 0]}
                    {claim.expiresAt && (
                      <>
                        {" "}
                        · {english ? "expires" : "expira"}: {claim.expiresAt.slice(0, 10)}
                        {claim.expired === true ? ` (${english ? "expired" : "expirada"})` : ""}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </details>

          <details className="etia-claims">
            <summary>{english ? "Limitations of this result" : "Límites de este resultado"}</summary>
            <ul>
              {(english ? report.limitationsEn : report.limitationsEs).map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div className="etia-levels">
        <h3>{english ? "Evidence levels" : "Niveles de evidencia"}</h3>
        <ol>
          {STANDARD_LEVELS.map((level) => (
            <li key={level.id}>
              <strong>{english ? level.labelEn : level.labelEs}</strong>
              <span>{english ? level.descriptionEn : level.descriptionEs}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
