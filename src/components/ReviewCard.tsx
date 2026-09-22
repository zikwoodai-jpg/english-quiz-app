import { useState } from 'react'
import type { VocabEntry } from '../types'
import { useAppState } from '../store/AppStateContext'

interface Props {
  entries: VocabEntry[]
  onDone: () => void
}

export function ReviewCard({ entries, onDone }: Props) {
  const { reviewVocab } = useAppState()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = entries[index]

  if (!current) {
    return (
      <div className="screen">
        <div className="empty-state">
          Повторення завершено ✅
          <br />
          <button className="primary-btn" onClick={onDone}>
            Назад до словника
          </button>
        </div>
      </div>
    )
  }

  const handleResult = (result: 'again' | 'good') => {
    reviewVocab(current.questionId, result)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(index / entries.length) * 100}%` }} />
      </div>
      <div className="card" onClick={() => setFlipped((f) => !f)} style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <div className="card-topline" style={{ justifyContent: 'center' }}>
          {flipped ? 'Пояснення' : 'Питання'} · тапни, щоб перевернути
        </div>
        <div className="card-prompt" style={{ marginBottom: 0 }}>
          {flipped ? current.translation : current.word}
        </div>
      </div>

      {flipped ? (
        <>
          <button className="primary-btn" style={{ background: 'var(--good)' }} onClick={() => handleResult('good')}>
            Знаю ✅
          </button>
          <button className="secondary-btn" onClick={() => handleResult('again')}>
            Повторити ще раз
          </button>
        </>
      ) : (
        <button className="primary-btn" onClick={() => setFlipped(true)}>
          Показати відповідь
        </button>
      )}
    </div>
  )
}
