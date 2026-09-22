import { useMemo, useState } from 'react'
import { PRONUNCIATION_ITEMS, type PronunciationItem } from '../data/pronunciation'
import { useAppState } from '../store/AppStateContext'
import { isSpeechRecognitionSupported, listenOnce, speak } from '../utils/speech'
import { pronunciationScore } from '../utils/similarity'

type Status = 'idle' | 'listening' | 'error'

interface Props {
  audience: PronunciationItem['audience']
  onBack: () => void
}

export function PronunciationDrill({ audience, onBack }: Props) {
  const { state, recordPronunciationScore } = useAppState()
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [lastHeard, setLastHeard] = useState<string | null>(null)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const items = useMemo(() => PRONUNCIATION_ITEMS.filter((p) => p.audience === audience), [audience])

  const sttSupported = isSpeechRecognitionSupported()
  const item = items[index]
  const bestScore = item ? state.pronunciationBestScores[item.id] : undefined

  const goTo = (i: number) => {
    setIndex((i + items.length) % items.length)
    setLastHeard(null)
    setLastScore(null)
    setError(null)
    setStatus('idle')
  }

  const handleListen = () => speak(item.phrase)

  const handleRecord = async () => {
    setError(null)
    setStatus('listening')
    try {
      const result = await listenOnce()
      const score = pronunciationScore(item.phrase, result.transcript)
      setLastHeard(result.transcript)
      setLastScore(score)
      recordPronunciationScore(item.id, score)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  const scoreColor = (score: number) => (score >= 80 ? 'var(--good)' : score >= 50 ? 'var(--accent-2)' : 'var(--bad)')

  return (
    <div className="screen">
      <div className="card-topline">
        <button className="secondary-btn" style={{ margin: 0, width: 'auto', padding: '4px 10px' }} onClick={onBack}>
          ← Назад
        </button>
        <span>
          {items.length ? index + 1 : 0} / {items.length}
        </span>
      </div>

      {!sttSupported && (
        <div className="explanation" style={{ marginTop: 12 }}>
          ⚠️ Цей браузер не підтримує розпізнавання мовлення (потрібен Chrome або Edge). Можна прослухати правильну вимову, але оцінку не отримаєте.
        </div>
      )}

      {item && (
        <div className="card" style={{ marginTop: 12, textAlign: 'center' }}>
          <div className="card-prompt">{item.phrase}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 4 }}>{item.translation}</div>
          <div style={{ color: 'var(--accent-2)', fontSize: 12, marginBottom: 18 }}>💡 {item.tip}</div>

          <button className="secondary-btn" onClick={handleListen}>
            🔊 Слухати
          </button>

          {sttSupported && (
            <button className="primary-btn" onClick={handleRecord} disabled={status === 'listening'}>
              {status === 'listening' ? '🎙️ Слухаю…' : '🎤 Сказати вголос'}
            </button>
          )}

          {error && <div className="explanation" style={{ color: 'var(--bad)' }}>{error}</div>}

          {lastScore !== null && (
            <div className="explanation">
              Почув: «{lastHeard}»
              <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(lastScore), marginTop: 6 }}>{lastScore}%</div>
            </div>
          )}

          {bestScore !== undefined && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>Найкращий результат: {bestScore}%</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="secondary-btn" style={{ flex: 1 }} onClick={() => goTo(index - 1)}>
          ← Попередня
        </button>
        <button className="secondary-btn" style={{ flex: 1 }} onClick={() => goTo(index + 1)}>
          Наступна →
        </button>
      </div>
    </div>
  )
}
