"use client"

import { useState } from "react"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import {
  LATAMV_V2_DEMO_GENES,
  evaluateConstitution,
  isGeneActive,
  requiredApprovals,
  type GovernanceContext,
  type ImpactLevel,
  type RuleCondition,
} from "@/lib/governance/latamv-v2"

/** Fixed demonstration time: validity windows must be reproducible. */
const EVALUATED_AT = "2026-11-25T12:00:00.000Z"

const conditions: RuleCondition[] = ["pii_without_consent", "restricted_dataset", "high_impact_action"]
const impacts: ImpactLevel[] = [0, 1, 2, 3, 4]

export function TamvLatamvConstitution({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [condition, setCondition] = useState<RuleCondition>("high_impact_action")
  const [impact, setImpact] = useState<ImpactLevel>(3)
  const [approvals, setApprovals] = useState(2)

  const context: GovernanceContext = {
    jurisdiction: "LATAM",
    condition,
    impact,
    identity: true,
    authority: true,
    policy: true,
    evidence: true,
    safety: true,
    consensusApprovals: approvals,
  }
  const decision = evaluateConstitution(LATAMV_V2_DEMO_GENES, context, EVALUATED_AT)
  const activeGenes = LATAMV_V2_DEMO_GENES.filter(
    (gene) => gene.condition === condition && isGeneActive(gene, EVALUATED_AT),
  )
  const need = requiredApprovals(impact)
  const conditionLabels: Record<RuleCondition, string> = {
    pii_without_consent: english ? "PII without consent" : "PII sin consentimiento",
    restricted_dataset: english ? "Restricted dataset" : "Dataset restringido",
    high_impact_action: english ? "High-impact action" : "Acción de alto impacto",
    unverified_rule: english ? "Unverified rule" : "Regla no verificada",
  }
  const reasonLabels: Record<typeof decision.reason, string> = {
    no_active_rule: english ? "No active rule for this condition and date" : "No hay regla vigente para esta condición y fecha",
    rule_denied: english ? "The strictest active rule denies the action" : "La regla vigente más estricta deniega la acción",
    missing_factor: english ? "A required factor is missing" : "Falta un factor requerido",
    consensus_insufficient: english ? "Approval count below the impact threshold" : "Aprobaciones por debajo del umbral de impacto",
    all_factors_present: english ? "All factors and the approval count are present" : "Todos los factores y las aprobaciones están presentes",
  }

  return (
    <section className="sovereign-inspector-panel" id="latamv-cdv" aria-labelledby="latamv-cdv-title">
      <div className="sovereign-panel-topline">
        <span><ShieldCheck aria-hidden="true" /> LATAMV 2.0 / CDV</span>
        <span className="sovereign-demo-label">{english ? "LOCAL EVALUATION" : "EVALUACIÓN LOCAL"}</span>
      </div>
      <h3 id="latamv-cdv-title">{english ? "Living-constitution rule evaluator" : "Evaluador de reglas de constitución viva"}</h3>
      <p>
        {english
          ? "Select a deterministic scenario. The evaluator applies validity windows, deny-by-default, strictest-wins and an approval count. It does not verify signatures, identities, ZK proofs or legal compliance."
          : "Selecciona un escenario determinista. El evaluador aplica vigencia temporal, denegación por defecto, regla más estricta y conteo de aprobaciones. No verifica firmas, identidades, pruebas ZK ni cumplimiento legal."}
      </p>
      <div className="sovereign-constitution-controls">
        <label htmlFor="cdv-condition">{english ? "Condition" : "Condición"}</label>
        <select id="cdv-condition" value={condition} onChange={(event) => setCondition(event.target.value as RuleCondition)}>
          {conditions.map((item) => <option key={item} value={item}>{conditionLabels[item]}</option>)}
        </select>
        <label htmlFor="cdv-impact">{english ? "Impact level" : "Nivel de impacto"}</label>
        <select id="cdv-impact" value={impact} onChange={(event) => setImpact(Number(event.target.value) as ImpactLevel)}>
          {impacts.map((item) => <option key={item} value={item}>{item} · {requiredApprovals(item)}</option>)}
        </select>
        <label htmlFor="cdv-approvals">{english ? "Approval count" : "Conteo de aprobaciones"}</label>
        <input id="cdv-approvals" type="number" min={0} max={3} value={approvals} onChange={(event) => setApprovals(Math.min(3, Math.max(0, Number(event.target.value) || 0)))} />
      </div>
      <div className="sovereign-constitution-result" data-allowed={decision.allowed ? "true" : "false"} role="status" aria-live="polite">
        <div><ShieldCheck aria-hidden="true" /><strong>{decision.allowed ? "ALLOW" : "DENY"} · {reasonLabels[decision.reason]}</strong></div>
        <p>
          {english ? "Rule" : "Regla"}: <code>{decision.matchedRuleId ?? "—"}</code>
          {" · "}
          {english ? "Active genes" : "Genes activos"}: {activeGenes.length}
          {" · "}
          {english ? "Required" : "Requeridas"}: {need}
          {" · "}
          {english ? "Supplied" : "Aportadas"}: {approvals}
          {" · "}
          {english ? "Evaluated at" : "Evaluado el"}: <code>{EVALUATED_AT}</code>
        </p>
      </div>
      <p className="sovereign-notice">
        {english
          ? "Deterministic local logic on demonstration data. This is not production authorization, a cryptographic quorum, a ZK proof, legal compliance or a certification. See the LATAMV 2.0 specification."
          : "Lógica local determinista sobre datos de demostración. No es autorización de producción, un quórum criptográfico, una prueba ZK, cumplimiento legal ni una certificación. Consulta la especificación LATAMV 2.0."}
      </p>
      <div className="sovereign-algorithm-line"><span>CDV</span><span>R-DNA</span><span>STRICTEST-WINS</span><span>{english ? "COUNTED APPROVALS" : "APROBACIONES CONTADAS"}</span></div>
      <a className="sovereign-text-button" href="https://github.com/OsoPanda1/desarrollo-tamv-online-network/blob/main/docs/governance/latamv-v2-specification.md" target="_blank" rel="noopener noreferrer">{english ? "Read specification" : "Leer especificación"} <ArrowUpRight aria-hidden="true" /></a>
    </section>
  )
}
