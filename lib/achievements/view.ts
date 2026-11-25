import "server-only"

import {
  ACHIEVEMENT_TOTAL,
  EMPTY_FACTS,
  earnedExperience,
  evaluateAchievements,
  levelFor,
  type AchievementState,
} from "./catalog"
import { loadAchievementFacts } from "./facts"

export type AchievementView = {
  authenticated: boolean
  degraded: boolean
  states: AchievementState[]
  earned: number
  total: number
  experience: number
  level: ReturnType<typeof levelFor>
}

/**
 * The catalogue is public; the earned state is only computed for the signed-in
 * owner. If the database cannot answer, the view degrades to the catalogue
 * instead of inventing progress.
 */
export async function getAchievementView(userId: string | null): Promise<AchievementView> {
  if (!userId) {
    const states = evaluateAchievements(EMPTY_FACTS)
    const experience = earnedExperience(states)
    return {
      authenticated: false,
      degraded: false,
      states,
      earned: 0,
      total: ACHIEVEMENT_TOTAL,
      experience,
      level: levelFor(experience),
    }
  }

  let degraded = false
  let facts = EMPTY_FACTS
  try {
    facts = await loadAchievementFacts(userId)
  } catch {
    degraded = true
  }

  const states = evaluateAchievements(facts)
  const experience = earnedExperience(states)
  return {
    authenticated: true,
    degraded,
    states,
    earned: states.filter((state) => state.earned).length,
    total: ACHIEVEMENT_TOTAL,
    experience,
    level: levelFor(experience),
  }
}
