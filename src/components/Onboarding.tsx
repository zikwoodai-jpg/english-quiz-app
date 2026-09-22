import { useMemo, useState } from 'react'
import { shuffle } from '../utils/shuffle'
import { levelFromScore } from '../store/appState'
import { useAppState } from '../store/AppStateContext'
import { useQuestionBank } from '../store/QuestionBankContext'
import { QuizCard } from './QuizCard'

const TEST_SIZE = 6

export function Onboarding() {
  const { finishOnboarding } = useAppState()
  const { questions, categoryById, loading } = useQuestionBank()
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)

  const testQuestions = useMemo(() => shuffle(questions).slice(0, TEST_SIZE), [questions])

  if (loading && questions.length === 0) {
    return (
      <div className="screen">
        <div className="empty-state">Завантажуємо тест…</div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="screen">
        <div className="onboarding-hero">
          <div className="emoji">🧠</div>
          <h1>Дізнаємось твій рівень</h1>
          <p>
            {TEST_SIZE} коротких питань у тому ж форматі, що й вся стрічка: питання → пауза → відповідь. Це займе
            менше хвилини.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setStarted(true)}>
          Почати тест
        </button>
      </div>
    )
  }

  const current = testQuestions[index]

  if (!current) {
    const level = levelFromScore(correct, TEST_SIZE)
    const label = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[level]
    return (
      <div className="screen">
        <div className="onboarding-hero">
          <div className="emoji">🎉</div>
          <h1>Твій рівень: {label}</h1>
          <p>
            Правильних відповідей: {correct} з {TEST_SIZE}. Контент у стрічці підлаштується під цей рівень.
          </p>
        </div>
        <button className="primary-btn" onClick={() => finishOnboarding(level)}>
          До стрічки
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(index / TEST_SIZE) * 100}%` }} />
      </div>
      <QuizCard
        key={current.id}
        question={current}
        categoryMeta={categoryById[current.category]}
        onAnswer={(isCorrect) => {
          if (isCorrect) setCorrect((c) => c + 1)
          setIndex((i) => i + 1)
        }}
      />
    </div>
  )
}
