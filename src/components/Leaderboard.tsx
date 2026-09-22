import { useEffect, useState } from 'react'
import { useAppState } from '../store/AppStateContext'
import { getDeviceId, getDisplayName, setDisplayName } from '../social/identity'
import { getLeaderboard, submitScore, type LeaderboardEntry } from '../social/api'

const LEVEL_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export function Leaderboard() {
  const { state } = useAppState()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(getDisplayName())
  const deviceId = getDeviceId()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await getLeaderboard())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const publish = async () => {
    setError(null)
    try {
      setDisplayName(name || 'Анонім')
      await submitScore({
        deviceId,
        name: name.trim() || 'Анонім',
        score: state.totalCorrect,
        totalAnswered: state.totalAnswered,
        totalCorrect: state.totalCorrect,
        streak: state.streak,
        level: state.level,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-topline">
          <span>🏆 Мій результат</span>
        </div>
        <input
          className="option"
          style={{ marginBottom: 10 }}
          placeholder="Ваше ім'я в рейтингу"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
        />
        <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>
          Правильних відповідей: {state.totalCorrect} · streak {state.streak} · {state.level ? LEVEL_LABEL[state.level] : '—'}
        </div>
        <button className="primary-btn" onClick={publish}>
          Оновити мій рейтинг
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="empty-state">Завантаження…</div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          Тут поки нікого немає 🏁
          <br />
          Будьте першим — опублікуйте свій результат вище.
        </div>
      ) : (
        entries.map((e, i) => (
          <div className="vocab-item" key={e.deviceId} style={e.deviceId === deviceId ? { border: '1px solid var(--accent)' } : undefined}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, color: i < 3 ? 'var(--accent-2)' : 'var(--text-dim)', width: 22 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div>
                <div className="vocab-word">
                  {e.name} {e.deviceId === deviceId && <span className="pill-tiny">ви</span>}
                </div>
                <div className="vocab-translation">
                  streak {e.streak} · {e.level ? LEVEL_LABEL[e.level] ?? e.level : '—'}
                </div>
              </div>
            </div>
            <span className="due-badge" style={{ background: 'var(--accent)' }}>
              {e.score}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
