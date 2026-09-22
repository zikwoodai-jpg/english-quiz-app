import { useState } from 'react'
import type { Category, CategoryMeta, Level, Question } from '../types'

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

export interface QuestionDraft {
  category: Category
  level: Level
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Props {
  categories: CategoryMeta[]
  initial?: Question
  onCancel: () => void
  onSubmit: (draft: QuestionDraft) => Promise<void>
}

function emptyDraft(categories: CategoryMeta[]): QuestionDraft {
  return {
    category: categories[0]?.id ?? 'vocabulary',
    level: 'beginner',
    prompt: '',
    options: ['', ''],
    correctIndex: 0,
    explanation: '',
  }
}

export function QuestionForm({ categories, initial, onCancel, onSubmit }: Props) {
  const [draft, setDraft] = useState<QuestionDraft>(
    initial
      ? {
          category: initial.category,
          level: initial.level,
          prompt: initial.prompt,
          options: [...initial.options],
          correctIndex: initial.correctIndex,
          explanation: initial.explanation,
        }
      : emptyDraft(categories),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setOption = (idx: number, value: string) => {
    setDraft((d) => ({ ...d, options: d.options.map((o, i) => (i === idx ? value : o)) }))
  }

  const addOption = () => setDraft((d) => ({ ...d, options: [...d.options, ''] }))

  const removeOption = (idx: number) => {
    setDraft((d) => {
      const options = d.options.filter((_, i) => i !== idx)
      const correctIndex = d.correctIndex >= options.length ? 0 : d.correctIndex === idx ? 0 : d.correctIndex > idx ? d.correctIndex - 1 : d.correctIndex
      return { ...d, options, correctIndex }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (draft.options.some((o) => !o.trim())) {
      setError('Усі варіанти відповідей мають бути заповнені.')
      return
    }
    if (draft.options.length < 2) {
      setError('Потрібно щонайменше 2 варіанти відповіді.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, fontSize: 16 }}>{initial ? 'Редагувати картку' : 'Нова картка'}</h2>
      {error && <div className="error-box">{error}</div>}

      <div className="field">
        <label>Рубрика</label>
        <select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Category }))}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Рівень</label>
        <select value={draft.level} onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as Level }))}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Питання (prompt)</label>
        <textarea value={draft.prompt} onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))} required />
      </div>

      <div className="field">
        <label>Варіанти відповідей (позначте правильний)</label>
        {draft.options.map((opt, idx) => (
          <div className="option-row" key={idx}>
            <input type="radio" name="correct" checked={draft.correctIndex === idx} onChange={() => setDraft((d) => ({ ...d, correctIndex: idx }))} title="Правильна відповідь" />
            <input type="text" value={opt} onChange={(e) => setOption(idx, e.target.value)} placeholder={`Варіант ${idx + 1}`} />
            {draft.options.length > 2 && (
              <button type="button" className="btn-small btn-danger" onClick={() => removeOption(idx)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn-small" onClick={addOption}>
          + Додати варіант
        </button>
      </div>

      <div className="field">
        <label>Пояснення</label>
        <textarea value={draft.explanation} onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))} required />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Зберігаємо…' : initial ? 'Зберегти зміни' : 'Створити картку'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Скасувати
        </button>
      </div>
    </form>
  )
}
