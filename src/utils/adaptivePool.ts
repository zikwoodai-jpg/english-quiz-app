import type { Level, Question } from '../types'
import { shuffle } from './shuffle'

const LEVEL_ORDER: Level[] = ['beginner', 'intermediate', 'advanced']

/**
 * Формує сесію карток, зважену під поточний рівень користувача:
 * переважно картки поточного рівня, трохи легших (закріпити) і трохи складніших (виклик).
 * Без визначеного рівня (ще не проходив onboarding) — звичайний рівномірний мікс.
 */
export function buildAdaptivePool(questions: Question[], level: Level | null, size: number): Question[] {
  if (!level) return shuffle(questions).slice(0, size)

  const idx = LEVEL_ORDER.indexOf(level)
  const same = questions.filter((q) => q.level === level)
  const easier = idx > 0 ? questions.filter((q) => q.level === LEVEL_ORDER[idx - 1]) : []
  const harder = idx < LEVEL_ORDER.length - 1 ? questions.filter((q) => q.level === LEVEL_ORDER[idx + 1]) : []

  const sameCount = Math.ceil(size * 0.6)
  const easierCount = Math.floor(size * 0.25)
  const harderCount = size - sameCount - easierCount

  const picked = [
    ...shuffle(same).slice(0, sameCount),
    ...shuffle(easier).slice(0, easierCount),
    ...shuffle(harder).slice(0, harderCount),
  ]

  // Якщо якогось рівня не вистачило (мало карток у рубриці) — доповнюємо рештою банку.
  if (picked.length < Math.min(size, questions.length)) {
    const usedIds = new Set(picked.map((q) => q.id))
    const rest = shuffle(questions.filter((q) => !usedIds.has(q.id)))
    picked.push(...rest.slice(0, size - picked.length))
  }

  return shuffle(picked).slice(0, size)
}
