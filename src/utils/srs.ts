import type { VocabEntry } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Спрощений SM-2: "again" скидає інтервал, "good" — збільшує за ease factor. */
export function scheduleReview(entry: VocabEntry, result: 'again' | 'good'): VocabEntry {
  let { interval, repetitions, easeFactor } = entry

  if (result === 'again') {
    repetitions = 0
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 3
    else interval = Math.round(interval * easeFactor)
    easeFactor = Math.min(2.8, easeFactor + 0.1)
  }

  return {
    ...entry,
    interval,
    repetitions,
    easeFactor,
    dueAt: Date.now() + interval * DAY_MS,
    lastResult: result,
  }
}

export function makeVocabEntry(questionId: string, word: string, translation: string): VocabEntry {
  return {
    questionId,
    word,
    translation,
    interval: 0,
    repetitions: 0,
    easeFactor: 2.3,
    dueAt: Date.now(),
    lastResult: null,
  }
}

export function isDue(entry: VocabEntry): boolean {
  return entry.dueAt <= Date.now()
}
