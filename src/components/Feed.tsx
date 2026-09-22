import { useMemo, useState } from 'react'
import type { Category } from '../types'
import { buildAdaptivePool } from '../utils/adaptivePool'
import { useAppState } from '../store/AppStateContext'
import { useQuestionBank } from '../store/QuestionBankContext'
import { QuizCard } from './QuizCard'

const SESSION_SIZE = 10
const LEVEL_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export function Feed() {
  const { state, recordAnswer } = useAppState()
  const { questions, categories, categoryById, loading } = useQuestionBank()
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [levelBanner, setLevelBanner] = useState<{ level: string; direction: 'up' | 'down' } | null>(null)

  const pool = useMemo(() => {
    const base = activeCategory === 'all' ? questions : questions.filter((q) => q.category === activeCategory)
    return buildAdaptivePool(base, state.level, SESSION_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, seed, questions])

  const current = pool[index]
  const progress = pool.length ? Math.min(100, (index / pool.length) * 100) : 0

  const handleAnswer = (correct: boolean) => {
    if (!current) return
    const beforeLevel = state.level
    const { levelChanged, newLevel } = recordAnswer({
      questionId: current.id,
      correct,
      word: current.prompt,
      translation: current.explanation,
    })
    if (levelChanged && newLevel) {
      const order = ['beginner', 'intermediate', 'advanced']
      const direction = order.indexOf(newLevel) > order.indexOf(beforeLevel ?? 'beginner') ? 'up' : 'down'
      setLevelBanner({ level: newLevel, direction })
      window.setTimeout(() => setLevelBanner(null), 3200)
    }
    if (index + 1 >= pool.length) {
      setSeed((s) => s + 1)
      setIndex(0)
    } else {
      setIndex((i) => i + 1)
    }
  }

  const selectCategory = (cat: Category | 'all') => {
    setActiveCategory(cat)
    setSeed((s) => s + 1)
    setIndex(0)
  }

  if (loading && questions.length === 0) {
    return (
      <div className="screen">
        <div className="empty-state">Завантажуємо картки…</div>
      </div>
    )
  }

  return (
    <div className="screen">
      {levelBanner && (
        <div className={`level-banner ${levelBanner.direction}`}>
          {levelBanner.direction === 'up' ? '🚀 Рівень підвищено' : '🎯 Трохи знизили складність'}: {LEVEL_LABEL[levelBanner.level]}
        </div>
      )}

      <div className="chip-row">
        <button className={`chip ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => selectCategory('all')}>
          Все
        </button>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${activeCategory === c.id ? 'active' : ''}`} onClick={() => selectCategory(c.id)}>
            {c.emoji} {c.title}
          </button>
        ))}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {current ? (
        <QuizCard key={current.id} question={current} categoryMeta={categoryById[current.category]} onAnswer={handleAnswer} />
      ) : (
        <div className="empty-state">Немає питань у цій рубриці.</div>
      )}

      <div style={{ textAlign: 'center', marginTop: 14, color: 'var(--text-dim)', fontSize: 12 }}>
        Сьогодні відповідей: {state.totalAnswered} {state.level && `· рівень: ${LEVEL_LABEL[state.level]}`}
      </div>
    </div>
  )
}
