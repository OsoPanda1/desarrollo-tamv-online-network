export const MAX_PUBLIC_HCU_ATOMS = 250
export const MAX_PUBLIC_HCU_EDGES = 1_000
export const MAX_HCU_SIMULATION_WORK = 5_000_000

export type HcuWorkInput = {
  mcRuns: number
  startYear: number
  endYear: number
  atomCount: number
  edgeCount: number
  edgeFanout?: number
}

export function estimateHcuSimulationWork(input: HcuWorkInput): number {
  const horizon = input.endYear - input.startYear + 1
  return input.mcRuns * horizon * Math.max(1, input.atomCount) * Math.max(1, input.edgeCount) * Math.max(1, input.edgeFanout ?? 1)
}

export function isHcuGraphWithinLimits(atomCount: number, edgeCount: number): boolean {
  return atomCount <= MAX_PUBLIC_HCU_ATOMS && edgeCount <= MAX_PUBLIC_HCU_EDGES
}

export function isHcuSimulationWithinBudget(input: HcuWorkInput): boolean {
  return isHcuGraphWithinLimits(input.atomCount, input.edgeCount) &&
    estimateHcuSimulationWork(input) <= MAX_HCU_SIMULATION_WORK
}
