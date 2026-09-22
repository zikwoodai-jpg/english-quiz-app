import { useMemo, useState } from 'react'
import { useAppState } from '../store/AppStateContext'
import { isDue } from '../utils/srs'
import { ReviewCard } from './ReviewCard'
import { AddVocabPanel } from './AddVocabPanel'

export function VocabularyList() {
  const { state } = useAppState()
  const [reviewing, setReviewing] = useState(false)
  const [addingOpen, setAddingOpen] = useState(false)

  const entries = useMemo(() => Object.values(state.vocab), [state.vocab])
  const dueEntries = useMemo(() => entries.filter(isDue), [entries])

  if (reviewing) {
    return <ReviewCard entries={dueEntries} onDone={() => setReviewing(false)} />
  }

  return (
    <div className="screen">
      <div className="toolbar-row">
        <div>
          <div className="app-title" style={{ marginBottom: 4 }}>
            Мій словник
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>
            Помилки зі стрічки потрапляють сюди автоматично, а власні слова можна додати нижче.
          </p>
        </div>
      </div>

      {!addingOpen && (
        <button className="secondary-btn" onClick={() => setAddingOpen(true)}>
          + Додати свою колоду слів
        </button>
      )}
      {addingOpen && <AddVocabPanel onClose={() => setAddingOpen(false)} />}

      {entries.length === 0 ? (
        <div className="empty-state">
          Тут поки порожньо 🎉
          <br />
          Відповідайте на картки у стрічці або додайте свої слова кнопкою вище.
        </div>
      ) : (
        <>
          {dueEntries.length > 0 && (
            <button className="primary-btn" onClick={() => setReviewing(true)}>
              Повторити зараз ({dueEntries.length})
            </button>
          )}
          <div className="section-title">Усі картки ({entries.length})</div>
          {entries
            .sort((a, b) => a.dueAt - b.dueAt)
            .map((e) => (
              <div className="vocab-item" key={e.questionId}>
                <div>
                  <div className="vocab-word">
                    {e.word} {e.custom && <span className="pill-tiny">своє</span>}
                  </div>
                  <div className="vocab-translation">{e.translation}</div>
                </div>
                {isDue(e) ? <span className="due-badge">повторити</span> : <span className="vocab-translation">через {Math.max(1, e.interval)} дн.</span>}
              </div>
            ))}
        </>
      )}
    </div>
  )
}
