import { useEffect, useState } from 'react'
import { useAppState } from '../store/AppStateContext'
import { getDeviceId, getDisplayName, setDisplayName } from '../social/identity'
import { addMyChallengeId, getMyChallengeIds } from '../social/myChallenges'
import { createChallenge, getChallenge, joinChallenge, updateChallengeProgress, type Challenge } from '../social/api'

const TARGET_LABEL: Record<Challenge['targetType'], string> = {
  correct_answers: 'правильних відповідей',
  streak_days: 'днів streak поспіль',
}

export function Challenges() {
  const { state } = useAppState()
  const deviceId = getDeviceId()
  const [name, setName] = useState(getDisplayName())
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<Challenge['targetType']>('correct_answers')
  const [newTarget, setNewTarget] = useState(20)
  const [joinCode, setJoinCode] = useState('')

  const loadMine = async () => {
    setLoading(true)
    setError(null)
    try {
      const ids = getMyChallengeIds()
      const loaded = await Promise.all(ids.map((id) => getChallenge(id).catch(() => null)))
      setMyChallenges(loaded.filter((c): c is Challenge => c !== null))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMine()
  }, [])

  const currentProgress = (type: Challenge['targetType']) => (type === 'correct_answers' ? state.totalCorrect : state.streak)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setDisplayName(name || 'Анонім')
      const challenge = await createChallenge({
        title: newTitle.trim() || 'Виклик друзям',
        targetType: newType,
        targetValue: newTarget,
        creatorDeviceId: deviceId,
        creatorName: name || 'Анонім',
      })
      await updateChallengeProgress(challenge.id, deviceId, currentProgress(newType))
      addMyChallengeId(challenge.id)
      setNewTitle('')
      await loadMine()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setDisplayName(name || 'Анонім')
      const code = joinCode.trim().toLowerCase()
      if (!code) return
      const challenge = await joinChallenge(code, deviceId, name || 'Анонім')
      await updateChallengeProgress(challenge.id, deviceId, currentProgress(challenge.targetType))
      addMyChallengeId(challenge.id)
      setJoinCode('')
      await loadMine()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSync = async (challenge: Challenge) => {
    setError(null)
    try {
      await updateChallengeProgress(challenge.id, deviceId, currentProgress(challenge.targetType))
      await loadMine()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const shareChallenge = (challenge: Challenge) => {
    const url = `${window.location.origin}${window.location.pathname}?challenge=${challenge.id}`
    const text = `Приєднуйся до мого виклику "${challenge.title}" у QuizEnglish! Код: ${challenge.id}`
    if (navigator.share) {
      navigator.share({ title: challenge.title, text, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(`${text}\n${url}`)
      alert('Посилання скопійовано в буфер обміну')
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-topline">
          <span>➕ Новий виклик</span>
        </div>
        <form onSubmit={handleCreate}>
          <input className="option" style={{ marginBottom: 10 }} placeholder="Ваше ім'я" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
          <input className="option" style={{ marginBottom: 10 }} placeholder="Назва виклику (напр. Тиждень English)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={60} />
          <div className="chip-row" style={{ paddingBottom: 10 }}>
            <button type="button" className={`chip ${newType === 'correct_answers' ? 'active' : ''}`} onClick={() => setNewType('correct_answers')}>
              Правильні відповіді
            </button>
            <button type="button" className={`chip ${newType === 'streak_days' ? 'active' : ''}`} onClick={() => setNewType('streak_days')}>
              Днів streak
            </button>
          </div>
          <input
            className="option"
            style={{ marginBottom: 10 }}
            type="number"
            min={1}
            placeholder="Ціль (число)"
            value={newTarget}
            onChange={(e) => setNewTarget(Number(e.target.value))}
          />
          <button type="submit" className="primary-btn">
            Створити й поділитись кодом
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-topline">
          <span>🔑 Приєднатись за кодом</span>
        </div>
        <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8 }}>
          <input className="option" placeholder="Код виклику" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
          <button type="submit" className="secondary-btn" style={{ marginTop: 0, width: 'auto' }}>
            Приєднатись
          </button>
        </form>
      </div>

      <div className="section-title">Мої виклики</div>
      {loading ? (
        <div className="empty-state">Завантаження…</div>
      ) : myChallenges.length === 0 ? (
        <div className="empty-state">Ви ще не в жодному виклику. Створіть свій або приєднайтесь за кодом.</div>
      ) : (
        myChallenges.map((c) => {
          const sorted = [...c.participants].sort((a, b) => b.progress - a.progress)
          const me = c.participants.find((p) => p.deviceId === deviceId)
          return (
            <div className="card" key={c.id} style={{ marginBottom: 14 }}>
              <div className="card-topline">
                <span>🏁 {c.title}</span>
                <span className="pill">код: {c.id}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 10 }}>
                Ціль: {c.targetValue} {TARGET_LABEL[c.targetType]}
              </div>
              {sorted.map((p) => (
                <div key={p.deviceId} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>
                      {p.name} {p.deviceId === deviceId && <span className="pill-tiny">ви</span>}
                    </span>
                    <span>
                      {p.progress}/{c.targetValue}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 0 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, (p.progress / c.targetValue) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="form-actions" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="secondary-btn" style={{ flex: 1, marginTop: 0 }} onClick={() => handleSync(c)}>
                  🔄 Оновити прогрес
                </button>
                <button className="secondary-btn" style={{ flex: 1, marginTop: 0 }} onClick={() => shareChallenge(c)}>
                  📤 Поділитись
                </button>
              </div>
              {me && me.progress >= c.targetValue && <div className="explanation" style={{ color: 'var(--good)', marginTop: 10 }}>🎉 Ви досягли цілі!</div>}
            </div>
          )
        })
      )}
    </div>
  )
}
