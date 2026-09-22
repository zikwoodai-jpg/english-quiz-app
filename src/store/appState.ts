import type { AppState, Level } from '../types'

const STORAGE_KEY = 'quiz-english-app-state-v1'

export const initialState: AppState = {
  onboardingDone: false,
  level: null,
  streak: 0,
  lastActiveDay: null,
  totalAnswered: 0,
  totalCorrect: 0,
  answeredIds: [],
  vocab: {},
  correctStreak: 0,
  wrongStreak: 0,
  pronunciationBestScores: {},
  dialoguesCompleted: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) } as AppState
  } catch {
    return initialState
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors — non-critical for a local demo app
  }
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Оновлює streak при активності: +1 якщо вчора, лишити як є якщо сьогодні, скинути якщо розрив. */
export function bumpStreak(state: AppState): Pick<AppState, 'streak' | 'lastActiveDay'> {
  const today = todayKey()
  if (state.lastActiveDay === today) {
    return { streak: state.streak, lastActiveDay: today }
  }
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const streak = state.lastActiveDay === yesterday ? state.streak + 1 : 1
  return { streak, lastActiveDay: today }
}

export function levelFromScore(correct: number, total: number): Level {
  const ratio = total === 0 ? 0 : correct / total
  if (ratio >= 0.75) return 'advanced'
  if (ratio >= 0.4) return 'intermediate'
  return 'beginner'
}

const LEVEL_ORDER: Level[] = ['beginner', 'intermediate', 'advanced']
const PROMOTE_AFTER = 5 // стільки поспіль правильних на поточному рівні піднімає рівень
const DEMOTE_AFTER = 3 // стільки поспіль неправильних опускає рівень

/**
 * Адаптивна складність: після серії правильних відповідей на поточному рівні
 * стрічка "піднімає" рівень (складніші картки), після серії помилок — "опускає".
 */
export function adaptLevel(
  current: Level,
  correctStreak: number,
  wrongStreak: number,
  wasCorrect: boolean,
): { level: Level; correctStreak: number; wrongStreak: number } {
  const idx = LEVEL_ORDER.indexOf(current)

  if (wasCorrect) {
    const nextCorrectStreak = correctStreak + 1
    if (nextCorrectStreak >= PROMOTE_AFTER && idx < LEVEL_ORDER.length - 1) {
      return { level: LEVEL_ORDER[idx + 1], correctStreak: 0, wrongStreak: 0 }
    }
    return { level: current, correctStreak: nextCorrectStreak, wrongStreak: 0 }
  }

  const nextWrongStreak = wrongStreak + 1
  if (nextWrongStreak >= DEMOTE_AFTER && idx > 0) {
    return { level: LEVEL_ORDER[idx - 1], correctStreak: 0, wrongStreak: 0 }
  }
  return { level: current, correctStreak: 0, wrongStreak: nextWrongStreak }
}
