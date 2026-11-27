"use client"

import { useMemo, useState } from "react"
import { evaluateLgsGate, LGS_GATE_REQUIREMENTS, type LgsGate } from "@/lib/lgs/lifecycle-gates"

const gateLabels: Record<LgsGate, string> = {
  G1_INITIATIVE: "G1 · Iniciativa",
  G2_DESIGN: "G2 · Diseño",
  G3_DEVELOPMENT: "G3 · Desarrollo",
  G4_EVALUATION: "G4 · Evaluación",
  G5_AUTHORIZATION: "G5 · Autorización",
  G6_PRODUCTION: "G6 · Producción",
  G7_CHANGE: "G7 · Cambio",
  G8_RETIREMENT: "G8 · Retiro",
}

export function LgsLifecycleGatePanel() {
  const [gate, setGate] = useState<LgsGate>("G5_AUTHORIZATION")
  const [evidence, setEvidence] = useState<Record<string, boolean>>({})
  const requirements = LGS_GATE_REQUIREMENTS[gate] as readonly string[]
  const result = useMemo(() => evaluateLgsGate(gate, evidence), [gate, evidence])

  return (
    <section className="lgs-panel lgs-gate-panel" aria-labelledby="lgs-gates-title">
      <div className="lgs-panel-heading">
        <div>
          <p className="eyebrow">05A / PUERTAS DE CONTROL</p>
          <h2 id="lgs-gates-title">Validación del ciclo de vida</h2>
          <p>Marca evidencia disponible para observar cómo se bloquea o habilita una puerta. Esta simulación no registra aprobaciones ni autoriza despliegues.</p>
        </div>
      </div>
      <label className="lgs-gate-selector">
        <span>Puerta evaluada</span>
        <select value={gate} onChange={(event) => setGate(event.target.value as LgsGate)}>
          {(Object.keys(LGS_GATE_REQUIREMENTS) as LgsGate[]).map((key) => (
            <option key={key} value={key}>{gateLabels[key]}</option>
          ))}
        </select>
      </label>
      <div className="lgs-gate-requirements">
        {requirements.map((requirement) => (
          <label key={requirement}>
            <input
              type="checkbox"
              checked={evidence[`${gate}:${requirement}`] === true}
              onChange={(event) => setEvidence((current) => ({
                ...current,
                [`${gate}:${requirement}`]: event.target.checked,
              }))}
            />
            <span>{requirement.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span>
          </label>
        ))}
      </div>
      <div className={`lgs-gate-decision ${result.allowed ? "is-open" : "is-blocked"}`} role="status" aria-live="polite">
        <strong>{result.allowed ? "Requisitos presentes en esta simulación" : "Puerta bloqueada"}</strong>
        <span>{result.allowed ? "La lista local está completa; todavía requiere aprobación autenticada y persistida." : `Faltan ${result.missing.length} requisito(s) explícitos.`}</span>
      </div>
      {result.missing.length > 0 && (
        <ul className="lgs-gate-missing">
          {result.missing.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
      <p className="lgs-caveat">Las casillas solo mantienen estado en el navegador. No constituyen evidencia auditada, firma, aprobación ni autorización de producción.</p>
    </section>
  )
}
