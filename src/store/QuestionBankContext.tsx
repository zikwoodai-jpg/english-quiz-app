import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CategoryMeta, Question } from '../types'
import { fetchCategories, fetchQuestions } from '../api/client'
import { QUESTIONS as FALLBACK_QUESTIONS } from '../data/questions'
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/categories'

interface QuestionBank {
  questions: Question[]
  categories: CategoryMeta[]
  categoryById: Record<string, CategoryMeta>
  loading: boolean
  /** "api" коли банк прийшов з бекенду, "offline" коли використали вбудований запасний банк */
  source: 'api' | 'offline'
}

const QuestionBankCtx = createContext<QuestionBank | null>(null)

export function QuestionBankProvider({ children }: { children: ReactNode }) {
  const [bank, setBank] = useState<QuestionBank>({
    questions: FALLBACK_QUESTIONS,
    categories: FALLBACK_CATEGORIES,
    categoryById: Object.fromEntries(FALLBACK_CATEGORIES.map((c) => [c.id, c])),
    loading: true,
    source: 'offline',
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [questions, categories] = await Promise.all([fetchQuestions(), fetchCategories()])
        if (cancelled) return
        if (questions.length === 0) throw new Error('API returned empty question bank')
        setBank({
          questions,
          categories: categories.length ? categories : FALLBACK_CATEGORIES,
          categoryById: Object.fromEntries((categories.length ? categories : FALLBACK_CATEGORIES).map((c) => [c.id, c])),
          loading: false,
          source: 'api',
        })
      } catch {
        // Бекенд недоступний (офлайн/перший запуск без мережі) — лишаємось на вбудованому банку.
        if (!cancelled) setBank((b) => ({ ...b, loading: false }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <QuestionBankCtx.Provider value={bank}>{children}</QuestionBankCtx.Provider>
}

export function useQuestionBank() {
  const ctx = useContext(QuestionBankCtx)
  if (!ctx) throw new Error('useQuestionBank must be used within QuestionBankProvider')
  return ctx
}
