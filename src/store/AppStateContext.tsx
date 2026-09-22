import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppState, Level, VocabEntry } from '../types'
import { adaptLevel, bumpStreak, initialState, loadState, saveState } from './appState'
import { makeVocabEntry, scheduleReview } from '../utils/srs'

interface AppStateApi {
  state: AppState
  finishOnboarding: (level: Level) => void
  recordAnswer: (params: {
    questionId: string
    correct: boolean
    word: string
    translation: string
  }) => { levelChanged: boolean; newLevel: Level | null }
  reviewVocab: (questionId: string, result: 'again' | 'good') => void
  addCustomVocab: (word: string, translation: string) => void
  addCustomVocabBulk: (pairs: { word: string; translation: string }[]) => number
  recordPronunciationScore: (itemId: string, score: number) => void
  markDialogueCompleted: (dialogueId: string) => void
  resetProgress: () => void
}

const AppStateCtx = createContext<AppStateApi | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const finishOnboarding = (level: Level) => {
    setState((s) => ({ ...s, onboardingDone: true, level, ...bumpStreak(s) }))
  }

  const recordAnswer: AppStateApi['recordAnswer'] = ({ questionId, correct, word, translation }) => {
    let levelChanged = false
    let newLevel: Level | null = null

    setState((s) => {
      const streakUpdate = bumpStreak(s)
      const nextVocab = { ...s.vocab }
      // Неправильні відповіді автоматично йдуть у "мій словник" на повторення.
      if (!correct && !nextVocab[questionId]) {
        nextVocab[questionId] = makeVocabEntry(questionId, word, translation)
      }

      const adapted = s.level ? adaptLevel(s.level, s.correctStreak, s.wrongStreak, correct) : null
      if (adapted && adapted.level !== s.level) {
        levelChanged = true
        newLevel = adapted.level
      }

      return {
        ...s,
        ...streakUpdate,
        totalAnswered: s.totalAnswered + 1,
        totalCorrect: s.totalCorrect + (correct ? 1 : 0),
        answeredIds: s.answeredIds.includes(questionId) ? s.answeredIds : [...s.answeredIds, questionId],
        vocab: nextVocab,
        level: adapted ? adapted.level : s.level,
        correctStreak: adapted ? adapted.correctStreak : s.correctStreak,
        wrongStreak: adapted ? adapted.wrongStreak : s.wrongStreak,
      }
    })

    return { levelChanged, newLevel }
  }

  const reviewVocab = (questionId: string, result: 'again' | 'good') => {
    setState((s) => {
      const entry = s.vocab[questionId]
      if (!entry) return s
      const updated: VocabEntry = scheduleReview(entry, result)
      return { ...s, vocab: { ...s.vocab, [questionId]: updated } }
    })
  }

  const addCustomVocab = (word: string, translation: string) => {
    setState((s) => {
      const id = `custom-${crypto.randomUUID()}`
      const entry: VocabEntry = { ...makeVocabEntry(id, word, translation), custom: true }
      return { ...s, vocab: { ...s.vocab, [id]: entry } }
    })
  }

  const addCustomVocabBulk = (pairs: { word: string; translation: string }[]) => {
    setState((s) => {
      const nextVocab = { ...s.vocab }
      for (const { word, translation } of pairs) {
        const id = `custom-${crypto.randomUUID()}`
        nextVocab[id] = { ...makeVocabEntry(id, word, translation), custom: true }
      }
      return { ...s, vocab: nextVocab }
    })
    return pairs.length
  }

  const recordPronunciationScore = (itemId: string, score: number) => {
    setState((s) => {
      const best = s.pronunciationBestScores[itemId] ?? 0
      if (score <= best) return s
      return { ...s, pronunciationBestScores: { ...s.pronunciationBestScores, [itemId]: score } }
    })
  }

  const markDialogueCompleted = (dialogueId: string) => {
    setState((s) => (s.dialoguesCompleted.includes(dialogueId) ? s : { ...s, dialoguesCompleted: [...s.dialoguesCompleted, dialogueId] }))
  }

  const resetProgress = () => setState(initialState)

  return (
    <AppStateCtx.Provider
      value={{
        state,
        finishOnboarding,
        recordAnswer,
        reviewVocab,
        addCustomVocab,
        addCustomVocabBulk,
        recordPronunciationScore,
        markDialogueCompleted,
        resetProgress,
      }}
    >
      {children}
    </AppStateCtx.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
