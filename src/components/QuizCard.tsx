import { useState } from 'react'
import type { CategoryMeta, Question } from '../types'

interface Props {
  question: Question
  categoryMeta?: CategoryMeta
  onAnswer: (correct: boolean) => void
}

export function QuizCard({ question, categoryMeta, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const category = categoryMeta ?? { emoji: '❓', title: question.category, id: question.category, description: '' }

  const pick = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    // Коротка пауза-вгадування перед реведом — саме той гачок утримання з відео-формату.
    window.setTimeout(() => setRevealed(true), 550)
  }

  const optionClass = (idx: number) => {
    if (selected === null) return 'option'
    if (idx === question.correctIndex && revealed) return 'option correct'
    if (idx === selected && idx !== question.correctIndex && revealed) return 'option incorrect'
    if (idx === selected) return 'option selected'
    return 'option'
  }

  const handleNext = () => {
    onAnswer(selected === question.correctIndex)
  }

  return (
    <div className="card">
      <div className="card-topline">
        <span>
          {category.emoji} {category.title}
        </span>
        <span>{question.level}</span>
      </div>
      <div className="card-prompt">{question.prompt}</div>
      {question.options.map((opt, idx) => (
        <button key={idx} className={optionClass(idx)} disabled={selected !== null} onClick={() => pick(idx)}>
          {opt}
        </button>
      ))}
      {revealed && <div className="explanation">💡 {question.explanation}</div>}
      {revealed && (
        <button className="primary-btn" onClick={handleNext}>
          Далі
        </button>
      )}
    </div>
  )
}
