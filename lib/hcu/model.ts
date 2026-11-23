import { canonicalJson, sha256 } from "../research/provenance.ts"
import type { SimulationInput } from "../validation.ts"

export const HCU_MODEL_VERSION = "tamv-hcu-exploratory-v2"

export type HcuAtom = {
  id: string
  domainId: string
  influenceX: number
  riskY: number
  evidenceZ: number
  isQuarantined: boolean
}

export type HcuEdge = {
  id: string
  sourceAtomIds: string[]
  targetAtomIds: string[]
  weight: number
  sign: number
  delayYears: number
  evidenceStatus: string
}

export type HcuSimulationOutput = {
  modelVersion: string
  assumptions: string[]
  inputHash: string
  sourceGraphHash?: string
  input?: SimulationInput
  series: Array<{
    year: number
    p10: number
    median: number
    p90: number
    meanRisk: number
    meanEvidence: number
    uncertainty: number
    adjustedPotential: number
    coherence: number
  }>
  quarantinedAtomIds: string[]
}

type ScenarioParameters = { gain: number; decay: number; riskAmplification: number }

const scenarios: Record<SimulationInput["scenario"], ScenarioParameters> = {
  baseline: { gain: 0.8, decay: 0.6, riskAmplification: 0.2 },
  conservative: { gain: 1, decay: 0.72, riskAmplification: 0.5 },
  collaborative: { gain: 1.3, decay: 0.85, riskAmplification: 1 },
}

function clamp(value: number, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

function percentile(sortedValues: number[], fraction: number) {
  if (sortedValues.length === 0) return 0
  const index = Math.min(sortedValues.length - 1, Math.floor((sortedValues.length - 1) * fraction))
  return Number((sortedValues[index] * 100).toFixed(2))
}

function sampleParameters(edges: HcuEdge[], scenario: ScenarioParameters, random: () => number) {
  return {
    gain: scenario.gain * (0.85 + random() * 0.3),
    decay: Math.min(0.95, scenario.decay * (0.9 + random() * 0.2)),
    edges: edges.map((edge) => {
      const lagSample = random()
      const lagShift = lagSample < 1 / 3 ? -1 : lagSample < 2 / 3 ? 0 : 1
      return {
        ...edge,
        weight: Math.min(1, Math.max(0.05, edge.weight * (0.75 + random() * 0.5))),
        delayYears: Math.min(15, Math.max(1, edge.delayYears + lagShift)),
      }
    }),
  }
}

function runScenario(
  atoms: HcuAtom[],
  edges: HcuEdge[],
  input: SimulationInput,
  quarantined: Set<string>,
  parameters: ScenarioParameters,
  random: () => number,
) {
  const sampled = sampleParameters(edges, parameters, random)
  const years = Array.from({ length: input.endYear - input.startYear + 1 }, (_, index) => input.startYear + index)
  const states: Map<string, number>[] = []
  const trajectory: number[] = []

  for (let yearIndex = 0; yearIndex < years.length; yearIndex += 1) {
    const year = years[yearIndex]
    const previous = states[yearIndex - 1] ?? new Map(atoms.map((atom) => [atom.id, 0]))
    const next = new Map<string, number>()

    const domainMeans = new Map<string, number>()
    const domainMembers = new Map<string, HcuAtom[]>()
    for (const atom of atoms) {
      const group = domainMembers.get(atom.domainId) ?? []
      group.push(atom)
      domainMembers.set(atom.domainId, group)
    }
    for (const [domainId, members] of domainMembers) {
      const active = members.filter((atom) => !quarantined.has(atom.id))
      const mean = active.length
        ? active.reduce((sum, atom) => sum + (previous.get(atom.id) ?? 0), 0) / active.length
        : 0
      domainMeans.set(domainId, mean)
    }

    for (const atom of atoms) {
      let value = parameters.decay * (previous.get(atom.id) ?? 0)
      value += 0.1 * sampled.gain * (domainMeans.get(atom.domainId) ?? 0)

      for (const edge of sampled.edges) {
        if (!edge.targetAtomIds.includes(atom.id)) continue
        const sourceYearIndex = yearIndex - edge.delayYears
        if (sourceYearIndex < 0) continue
        const sourceState = states[sourceYearIndex]
        if (!sourceState) continue
        const liveSources = edge.sourceAtomIds.filter((sourceId) => !quarantined.has(sourceId))
        if (!liveSources.length) continue
        const sourceSignal = liveSources.reduce((sum, sourceId) => sum + (sourceState.get(sourceId) ?? 0), 0) / Math.sqrt(liveSources.length)
        const risk = atom.riskY / 100
        value += edge.sign * edge.weight * sampled.gain * (1 + parameters.riskAmplification * (risk - 0.5)) * sourceSignal
      }

      const shock = input.shocks
        .filter((item) => item.atomId === atom.id && item.year === year)
        .reduce((sum, item) => sum + item.intensity, 0)
      next.set(atom.id, clamp(value + shock))
    }

    states.push(next)
    const importance = atoms.reduce((sum, atom) => sum + atom.influenceX, 0)
    const tension = importance > 0
      ? atoms.reduce((sum, atom) => sum + atom.influenceX * Math.abs(next.get(atom.id) ?? 0), 0) / importance
      : 0
    trajectory.push(tension)
  }

  return { years, states, trajectory }
}

function yearMetrics(atoms: HcuAtom[], state: Map<string, number>, year: number) {
  const count = Math.max(1, atoms.length)
  const meanRisk = atoms.reduce((sum, atom) => sum + atom.riskY, 0) / count
  const meanEvidence = atoms.reduce((sum, atom) => sum + atom.evidenceZ, 0) / count
  const uncertainty = atoms.reduce((sum, atom) => {
    const evidence = atom.evidenceZ / 100
    const value = Math.min(1, Math.max(0, 0.1 + 0.5 * (1 - evidence) + 0.012 * (year - 2026)))
    return sum + value
  }, 0) / count
  const adjustedPotential = atoms.reduce((sum, atom) => {
    const evidence = atom.evidenceZ / 100
    const value = Math.min(1, Math.max(0, 0.1 + 0.5 * (1 - evidence) + 0.012 * (year - 2026)))
    return sum + atom.influenceX * (1 - value)
  }, 0) / count
  const coherence = atoms.reduce((sum, atom) => {
    const evidence = atom.evidenceZ / 100
    const value = Math.min(1, Math.max(0, 0.1 + 0.5 * (1 - evidence) + 0.012 * (year - 2026)))
    return sum + atom.evidenceZ * (1 - value)
  }, 0) / count
  const activationWeight = atoms.reduce((sum, atom) => sum + Math.abs(state.get(atom.id) ?? 0), 0)
  const activeRisk = activationWeight > 0
    ? atoms.reduce((sum, atom) => sum + atom.riskY * Math.abs(state.get(atom.id) ?? 0), 0) / activationWeight
    : meanRisk

  return {
    meanRisk: Number(activeRisk.toFixed(2)),
    meanEvidence: Number(meanEvidence.toFixed(2)),
    uncertainty: Number((uncertainty * 100).toFixed(2)),
    adjustedPotential: Number(adjustedPotential.toFixed(2)),
    coherence: Number(coherence.toFixed(2)),
  }
}

export function simulateHcu(
  atoms: HcuAtom[],
  edges: HcuEdge[],
  input: SimulationInput,
  sourceGraphHash = "",
): HcuSimulationOutput {
  const normalizedInput: SimulationInput = {
    ...input,
    shocks: [...input.shocks].sort((left, right) => left.year - right.year || left.atomId.localeCompare(right.atomId) || left.intensity - right.intensity),
    quarantine: [...input.quarantine].sort(),
  }
  const inputHash = sha256(canonicalJson({ modelVersion: HCU_MODEL_VERSION, sourceGraphHash, input: normalizedInput }))
  const quarantined = new Set([
    ...atoms.filter((atom) => atom.isQuarantined).map((atom) => atom.id),
    ...normalizedInput.quarantine,
  ])
  const scenario = scenarios[normalizedInput.scenario]
  const runs = Array.from({ length: normalizedInput.mcRuns }, (_, runIndex) => {
    const random = seededRandom((normalizedInput.seed + runIndex * 104_729) >>> 0)
    return runScenario(atoms, edges, normalizedInput, quarantined, scenario, random)
  })
  const years = runs[0]?.years ?? []

  const series = years.map((year, yearIndex) => {
    const ordered = runs.map((run) => run.trajectory[yearIndex] ?? 0).sort((left, right) => left - right)
    const metrics = yearMetrics(atoms, runs[0]?.states[yearIndex] ?? new Map(), year)
    return {
      year,
      p10: percentile(ordered, 0.1),
      median: percentile(ordered, 0.5),
      p90: percentile(ordered, 0.9),
      ...metrics,
    }
  })

  return {
    modelVersion: HCU_MODEL_VERSION,
    assumptions: [
      "El indicador 0–100 es tensión relativa simulada sobre activaciones acotadas entre −1 y 1; no es probabilidad, medición observada ni pronóstico causal.",
      "A, B y C son escenarios hipotéticos con ganancia, persistencia y amplificación por riesgo documentadas; sus parámetros no están calibrados empíricamente.",
      "Cada corrida usa la misma semilla y perturba peso ±25 %, rezago ±1 año, ganancia ±15 % y persistencia ±10 %; P10–P90 describe sensibilidad interna, no un intervalo de confianza poblacional.",
      "Una cuarentena impide que el nodo transmita por hiperaristas o por el promedio de su dominio, pero no impide que reciba efectos.",
      "La incertidumbre y coherencia usan evidencia declarada. Los valores y fuentes del grafo no equivalen a validación externa.",
    ],
    inputHash,
    sourceGraphHash,
    input: normalizedInput,
    series,
    quarantinedAtomIds: [...quarantined].sort(),
  }
}
