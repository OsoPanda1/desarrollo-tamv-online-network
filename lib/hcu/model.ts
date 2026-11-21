import { canonicalJson, sha256 } from "@/lib/research/provenance"
import type { SimulationInput } from "@/lib/validation"

export const HCU_MODEL_VERSION = "tamv-hcu-exploratory-v1"

export type HcuAtom = {
  id: string
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
  series: Array<{
    year: number
    p10: number
    median: number
    p90: number
    meanRisk: number
    meanEvidence: number
  }>
  quarantinedAtomIds: string[]
}

function clamp(value: number, min = 0, max = 1) {
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

export function simulateHcu(
  atoms: HcuAtom[],
  edges: HcuEdge[],
  input: SimulationInput,
): HcuSimulationOutput {
  const inputHash = sha256(canonicalJson(input))
  const atomById = new Map(atoms.map((atom) => [atom.id, atom]))
  const quarantined = new Set([
    ...atoms.filter((atom) => atom.isQuarantined).map((atom) => atom.id),
    ...input.quarantine,
  ])
  const scenarioFactor = {
    baseline: 1,
    conservative: 0.75,
    collaborative: 1.1,
  }[input.scenario]
  const years = Array.from({ length: input.endYear - input.startYear + 1 }, (_, index) => input.startYear + index)
  const runs: number[][] = []
  const evidenceMean = atoms.length ? atoms.reduce((sum, atom) => sum + atom.evidenceZ, 0) / atoms.length : 0
  const riskMean = atoms.length ? atoms.reduce((sum, atom) => sum + atom.riskY, 0) / atoms.length : 0
  const uncertainty = Math.max(0.008, (1 - evidenceMean / 100) * 0.035)

  for (let run = 0; run < input.mcRuns; run += 1) {
    const random = seededRandom((input.seed + run * 104_729) >>> 0)
    let values = new Map(atoms.map((atom) => [atom.id, clamp(atom.influenceX / 100)]))
    const trajectory: number[] = []

    for (const year of years) {
      const next = new Map<string, number>()
      for (const atom of atoms) {
        if (quarantined.has(atom.id)) {
          next.set(atom.id, 0)
          continue
        }

        let edgeSignal = 0
        for (const edge of edges) {
          if (year < input.startYear + edge.delayYears || !edge.targetAtomIds.includes(atom.id)) continue
          const liveSources = edge.sourceAtomIds.filter((sourceId) => !quarantined.has(sourceId) && atomById.has(sourceId))
          if (!liveSources.length) continue
          const sourceMean = liveSources.reduce((sum, sourceId) => sum + (values.get(sourceId) ?? 0), 0) / liveSources.length
          const sampledWeight = edge.weight * (0.85 + random() * 0.3)
          edgeSignal += sourceMean * sampledWeight * edge.sign * scenarioFactor
        }

        const yearShock = input.shocks
          .filter((shock) => shock.atomId === atom.id && shock.year === year)
          .reduce((sum, shock) => sum + shock.intensity * 0.06 * scenarioFactor, 0)
        const riskPenalty = (atom.riskY / 100) * 0.012
        const noise = (random() * 2 - 1) * uncertainty
        const updated = clamp((values.get(atom.id) ?? atom.influenceX / 100) + edgeSignal * 0.12 + yearShock - riskPenalty + noise)
        next.set(atom.id, updated)
      }
      values = next
      const active = atoms.filter((atom) => !quarantined.has(atom.id))
      const index = active.length
        ? active.reduce((sum, atom) => sum + (values.get(atom.id) ?? 0), 0) / active.length
        : 0
      trajectory.push(index * 100)
    }
    runs.push(trajectory)
  }

  const series = years.map((year, yearIndex) => {
    const ordered = runs.map((run) => run[yearIndex] ?? 0).sort((a, b) => a - b)
    return {
      year,
      p10: percentile(ordered, 0.1),
      median: percentile(ordered, 0.5),
      p90: percentile(ordered, 0.9),
      meanRisk: Number(riskMean.toFixed(2)),
      meanEvidence: Number(evidenceMean.toFixed(2)),
    }
  })

  return {
    modelVersion: HCU_MODEL_VERSION,
    assumptions: [
      "El índice 0–100 es una salida de simulación hipotética; no es una probabilidad, medición observada ni predicción causal.",
      "Las influencias parten de los valores declarados en el grafo público y se propagan por relaciones etiquetadas como hipótesis.",
      "Los intervalos P10–P90 describen variación interna del muestreo, no intervalos de confianza estadísticos sobre una población.",
      "El ruido depende de la puntuación de evidencia declarada; los nodos en cuarentena no transmiten señales.",
    ],
    inputHash,
    series,
    quarantinedAtomIds: [...quarantined].sort(),
  }
}
