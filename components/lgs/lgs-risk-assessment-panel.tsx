"use client"

import { useMemo, useState } from "react"
import { assessLgsRisk, type RiskDimension } from "@/lib/lgs/risk-engine"

type RiskValues = {
  likelihood: RiskDimension
  impact: RiskDimension
  exposure: RiskDimension
  velocity: RiskDimension
  uncertainty: RiskDimension
  irreversibility: RiskDimension
}

const dimensions: Array<{ key: keyof RiskValues; label: string; help: string }> = [
  { key: "likelihood", label: "Probabilidad", help: "Posibilidad razonada de que ocurra el evento." },
  { key: "impact", label: "Impacto", help: "Severidad potencial sobre personas, derechos u operaciones." },
  { key: "exposure", label: "Exposición", help: "Alcance de usuarios, sistemas o procesos expuestos." },
  { key: "velocity", label: "Velocidad", help: "Rapidez con la que puede propagarse el daño." },
  { key: "uncertainty", label: "Incertidumbre", help: "Grado de evidencia incompleta o desconocida." },
  { key: "irreversibility", label: "Irreversibilidad", help: "Dificultad para detener, corregir o reparar el daño." },
]

const initialRisk = (): RiskValues => ({
  likelihood: 2,
  impact: 2,
  exposure: 2,
  velocity: 2,
  uncertainty: 2,
  irreversibility: 2,
})

const bandLabels = {
  low: "Bajo",
  moderate: "Moderado",
  high: "Alto",
  "very-high": "Muy alto",
  critical: "Crítico",
} as const

const dispositionLabels = {
  review: "Revisión documentada",
  mitigate: "Mitigación obligatoria",
  escalate: "Escalación y aprobación reforzada",
  blocked: "BLOQUEADO por criterio de veto",
} as const

export function LgsRiskAssessmentPanel() {
  const [values, setValues] = useState<RiskValues>(initialRisk)
  const [rightsViolationLikely, setRightsViolationLikely] = useState(false)
  const [safetyCriticalUncontrolled, setSafetyCriticalUncontrolled] = useState(false)
  const [humanOversightAbsent, setHumanOversightAbsent] = useState(false)

  const result = useMemo(
    () => assessLgsRisk({ ...values, rightsViolationLikely, safetyCriticalUncontrolled, humanOversightAbsent }),
    [values, rightsViolationLikely, safetyCriticalUncontrolled, humanOversightAbsent],
  )

  return (
    <section className="lgs-panel lgs-risk-calculator" aria-labelledby="lgs-risk-calculator-title">
      <div className="lgs-panel-heading">
        <div>
          <p className="eyebrow">03A / EVALUACIÓN DETERMINISTA</p>
          <h2 id="lgs-risk-calculator-title">Calculadora de riesgo LGS</h2>
          <p>Escala de 1 a 5 por dimensión. El resultado ayuda a priorizar; no reemplaza el análisis contextual ni la aprobación humana.</p>
        </div>
      </div>

      <div className="lgs-risk-controls">
        {dimensions.map((dimension) => (
          <label className="lgs-risk-field" key={dimension.key}>
            <span>{dimension.label}</span>
            <small>{dimension.help}</small>
            <select
              value={values[dimension.key]}
              onChange={(event) => {
                const nextValue = Number(event.currentTarget.value) as RiskDimension
                setValues((current) => ({ ...current, [dimension.key]: nextValue }))
              }}
              aria-label={dimension.label}
            >
              <option value={1}>1 — Muy bajo</option>
              <option value={2}>2 — Bajo</option>
              <option value={3}>3 — Medio</option>
              <option value={4}>4 — Alto</option>
              <option value={5}>5 — Muy alto</option>
            </select>
          </label>
        ))}
      </div>

      <fieldset className="lgs-risk-vetoes">
        <legend>Criterios de veto no compensatorios</legend>
        <label>
          <input type="checkbox" checked={rightsViolationLikely} onChange={(event) => setRightsViolationLikely(event.currentTarget.checked)} />
          Riesgo probable de vulneración de derechos
        </label>
        <label>
          <input type="checkbox" checked={safetyCriticalUncontrolled} onChange={(event) => setSafetyCriticalUncontrolled(event.currentTarget.checked)} />
          Riesgo crítico de seguridad sin control efectivo
        </label>
        <label>
          <input type="checkbox" checked={humanOversightAbsent} onChange={(event) => setHumanOversightAbsent(event.currentTarget.checked)} />
          Falta la supervisión humana requerida
        </label>
      </fieldset>

      <div className={`lgs-risk-result ${result.disposition === "blocked" ? "is-blocked" : ""}`} role="status" aria-live="polite">
        <div className="lgs-risk-score">
          <span>Puntuación orientativa</span>
          <strong>{result.score}<small>/100</small></strong>
        </div>
        <div className="lgs-risk-decision">
          <span>Clasificación</span>
          <strong>{bandLabels[result.band]}</strong>
          <span>Tratamiento sugerido</span>
          <strong>{dispositionLabels[result.disposition]}</strong>
        </div>
      </div>

      {result.vetoes.length > 0 ? (
        <ul className="lgs-risk-veto-list" aria-label="Motivos de bloqueo">
          {result.vetoes.map((veto) => <li key={veto}>{veto}</li>)}
        </ul>
      ) : null}

      <p className="lgs-caveat">
        Fórmula: redondear 100 × (Σ pesoᵢ × dimensiónᵢ − 1) / 4. Pesos: impacto 0,30; probabilidad 0,20; exposición 0,15; irreversibilidad 0,15; velocidad 0,10; incertidumbre 0,10. Un veto bloquea independientemente de la puntuación.
      </p>
    </section>
  )
}
