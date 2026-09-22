import { useEffect, useMemo, useState } from 'react'
import type { CategoryMeta, Question } from '../types'
import { ApiError, createQuestion, deleteQuestion, getCategories, getQuestions, updateQuestion } from './api'
import { QuestionForm, type QuestionDraft } from './QuestionForm'

const TOKEN_KEY = 'quiz-admin-token'

export function AdminApp() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<CategoryMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [editing, setEditing] = useState<Question | 'new' | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [q, c] = await Promise.all([getQuestions(), getCategories()])
      setQuestions(q)
      setCategories(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])
  const filtered = useMemo(() => (filter === 'all' ? questions : questions.filter((q) => q.category === filter)), [questions, filter])

  const saveToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  const handleSubmit = async (draft: QuestionDraft) => {
    if (!token) return
    try {
      if (editing && editing !== 'new') {
        await updateQuestion(token, editing.id, draft)
      } else {
        await createQuestion(token, draft)
      }
      setEditing(null)
      await load()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
      }
      throw err
    }
  }

  const handleDelete = async (q: Question) => {
    if (!token) return
    if (!confirm(`Видалити картку "${q.prompt}"?`)) return
    try {
      await deleteQuestion(token, q.id)
      await load()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  if (!token) {
    return <TokenGate onSubmit={saveToken} />
  }

  return (
    <div>
      <h1>🔐 QuizEnglish — адмінка</h1>
      <p className="subtitle">
        Керування банком питань напряму через API. Токен зберігається лише в цьому браузері.{' '}
        <button className="btn-small" onClick={logout} style={{ marginLeft: 6 }}>
          Вийти
        </button>
      </p>

      {error && <div className="error-box">{error}</div>}

      {editing && (
        <QuestionForm
          categories={categories}
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      )}

      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Усі рубрики ({questions.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.title} ({questions.filter((q) => q.category === c.id).length})
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => setEditing('new')}>
          + Нова картка
        </button>
      </div>

      {loading ? (
        <div className="empty">Завантаження…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Питань не знайдено.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Рубрика</th>
              <th>Рівень</th>
              <th>Питання</th>
              <th>Варіанти</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id}>
                <td>
                  <span className="pill">
                    {categoryById[q.category]?.emoji} {categoryById[q.category]?.title ?? q.category}
                  </span>
                </td>
                <td>{q.level}</td>
                <td style={{ maxWidth: 320 }}>{q.prompt}</td>
                <td>
                  {q.options.map((o, i) => (
                    <div key={i}>
                      {i === q.correctIndex ? <span className="correct-tag">✓ </span> : null}
                      {o}
                    </div>
                  ))}
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-small" onClick={() => setEditing(q)}>
                      Редагувати
                    </button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(q)}>
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function TokenGate({ onSubmit }: { onSubmit: (token: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="token-gate">
      <h1>🔐 Адмін-доступ</h1>
      <p className="subtitle">Введіть admin-токен (x-admin-token), щоб керувати банком питань.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim()) onSubmit(value.trim())
        }}
      >
        <div className="field">
          <input type="password" placeholder="admin-token" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </div>
        <button type="submit" className="btn-primary">
          Увійти
        </button>
      </form>
    </div>
  )
}
