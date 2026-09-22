import { useState } from 'react'
import { useAppState } from '../store/AppStateContext'

function parseBulkText(text: string): { word: string; translation: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*[-—:]\s*/)
      return { word: (parts[0] ?? '').trim(), translation: (parts.slice(1).join(' - ') ?? '').trim() }
    })
    .filter((p) => p.word && p.translation)
}

export function AddVocabPanel({ onClose }: { onClose: () => void }) {
  const { addCustomVocab, addCustomVocabBulk } = useAppState()
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const submitSingle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !translation.trim()) return
    addCustomVocab(word.trim(), translation.trim())
    setWord('')
    setTranslation('')
    setFeedback('Слово додано ✅')
    window.setTimeout(() => setFeedback(null), 1800)
  }

  const submitBulk = (e: React.FormEvent) => {
    e.preventDefault()
    const pairs = parseBulkText(bulkText)
    if (pairs.length === 0) {
      setFeedback('Не вдалося розпізнати жодного рядка. Формат: слово - переклад')
      return
    }
    const count = addCustomVocabBulk(pairs)
    setBulkText('')
    setFeedback(`Імпортовано слів: ${count} ✅`)
    window.setTimeout(() => setFeedback(null), 2200)
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-topline">
        <span>📥 Своя колода</span>
        <button className="secondary-btn" style={{ margin: 0, width: 'auto', padding: '4px 10px' }} onClick={onClose}>
          Згорнути
        </button>
      </div>

      <div className="chip-row" style={{ paddingBottom: 12 }}>
        <button className={`chip ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
          Одне слово
        </button>
        <button className={`chip ${mode === 'bulk' ? 'active' : ''}`} onClick={() => setMode('bulk')}>
          Список
        </button>
      </div>

      {feedback && <div className="explanation">{feedback}</div>}

      {mode === 'single' ? (
        <form onSubmit={submitSingle}>
          <input
            className="option"
            style={{ marginBottom: 10 }}
            placeholder="Слово чи фраза (напр. procrastinate)"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
          <input
            className="option"
            style={{ marginBottom: 10 }}
            placeholder="Переклад / пояснення"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            Додати в словник
          </button>
        </form>
      ) : (
        <form onSubmit={submitBulk}>
          <textarea
            className="option"
            style={{ minHeight: 120, marginBottom: 10, width: '100%', fontFamily: 'inherit' }}
            placeholder={'По одному рядку на слово:\nprocrastinate - відкладати на потім\nresilient - стійкий'}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            Імпортувати список
          </button>
        </form>
      )}
    </div>
  )
}
