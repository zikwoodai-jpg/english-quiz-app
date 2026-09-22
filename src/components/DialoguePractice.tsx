import { useEffect, useState } from 'react'
import type { Dialogue } from '../data/dialogues'
import { useAppState } from '../store/AppStateContext'
import { isSpeechRecognitionSupported, listenOnce, speak } from '../utils/speech'
import { containsAnyPhrase } from '../utils/similarity'

interface Props {
  dialogue: Dialogue
  onBack: () => void
}

export function DialoguePractice({ dialogue, onBack }: Props) {
  const { markDialogueCompleted } = useAppState()
  const [stepIndex, setStepIndex] = useState(0)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'retry' | null>(null)
  const [lastHeard, setLastHeard] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sttSupported = isSpeechRecognitionSupported()
  const step = dialogue.steps[stepIndex]
  const finished = stepIndex >= dialogue.steps.length

  useEffect(() => {
    if (!finished) speak(step.npcLine)
    if (finished) markDialogueCompleted(dialogue.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, finished])

  const checkAnswer = (text: string) => {
    const ok = containsAnyPhrase(text, step.expectedPhrases)
    setFeedback(ok ? 'correct' : 'retry')
    setLastHeard(text)
  }

  const handleRecord = async () => {
    setError(null)
    setListening(true)
    try {
      const result = await listenOnce()
      checkAnswer(result.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setListening(false)
    }
  }

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedAnswer.trim()) return
    checkAnswer(typedAnswer)
  }

  const goNext = () => {
    setStepIndex((i) => i + 1)
    setTypedAnswer('')
    setFeedback(null)
    setLastHeard(null)
    setError(null)
  }

  if (finished) {
    return (
      <div className="screen">
        <div className="empty-state">
          🎉 Діалог "{dialogue.title}" завершено!
          <br />
          <button className="primary-btn" onClick={onBack}>
            До списку діалогів
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="card-topline">
        <button className="secondary-btn" style={{ margin: 0, width: 'auto', padding: '4px 10px' }} onClick={onBack}>
          ← Назад
        </button>
        <span>
          {dialogue.emoji} {dialogue.title} · {stepIndex + 1}/{dialogue.steps.length}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(stepIndex / dialogue.steps.length) * 100}%` }} />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-topline">
          <span>🗣️ Співрозмовник</span>
          <button className="btn-icon" onClick={() => speak(step.npcLine)}>
            🔊
          </button>
        </div>
        <div className="card-prompt" style={{ marginBottom: 6 }}>
          {step.npcLine}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{step.npcTranslation}</div>
      </div>

      {feedback === 'correct' ? (
        <div className="explanation" style={{ color: 'var(--good)' }}>
          ✅ Чудово! Ваша відповідь: «{lastHeard}»
        </div>
      ) : (
        <>
          {feedback === 'retry' && (
            <div className="explanation" style={{ color: 'var(--bad)' }}>
              Почули: «{lastHeard}». Спробуйте фразу на кшталт: <b>{step.hint}</b>
            </div>
          )}
          {error && <div className="explanation" style={{ color: 'var(--bad)' }}>{error}</div>}

          {sttSupported && (
            <button className="primary-btn" onClick={handleRecord} disabled={listening}>
              {listening ? '🎙️ Слухаю…' : '🎤 Відповісти голосом'}
            </button>
          )}

          <form onSubmit={submitTyped}>
            <input
              className="option"
              style={{ marginTop: 10 }}
              placeholder="Або напишіть відповідь англійською…"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
            />
            <button type="submit" className="secondary-btn">
              Надіслати текст
            </button>
          </form>
        </>
      )}

      {feedback === 'correct' && (
        <button className="primary-btn" onClick={goNext}>
          Далі →
        </button>
      )}
      {feedback === 'retry' && (
        <button className="secondary-btn" onClick={goNext}>
          Пропустити крок →
        </button>
      )}
    </div>
  )
}
