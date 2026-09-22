import { useMemo, useState } from 'react'
import { DIALOGUES, type Dialogue } from '../data/dialogues'
import { PRONUNCIATION_ITEMS } from '../data/pronunciation'
import { useAppState } from '../store/AppStateContext'
import { isSpeechRecognitionSupported } from '../utils/speech'
import { PronunciationDrill } from './PronunciationDrill'
import { DialoguePractice } from './DialoguePractice'

type View = { mode: 'hub' } | { mode: 'pronunciation' } | { mode: 'dialogue'; dialogue: Dialogue }
type Audience = 'general' | 'kids'

export function Speaking() {
  const { state } = useAppState()
  const [view, setView] = useState<View>({ mode: 'hub' })
  const [audience, setAudience] = useState<Audience>('general')
  const sttSupported = isSpeechRecognitionSupported()

  const dialogues = useMemo(() => DIALOGUES.filter((d) => d.audience === audience), [audience])
  const pronunciationCount = useMemo(() => PRONUNCIATION_ITEMS.filter((p) => p.audience === audience).length, [audience])

  if (view.mode === 'pronunciation') {
    return <PronunciationDrill audience={audience} onBack={() => setView({ mode: 'hub' })} />
  }
  if (view.mode === 'dialogue') {
    return <DialoguePractice dialogue={view.dialogue} onBack={() => setView({ mode: 'hub' })} />
  }

  return (
    <div className="screen">
      <div className="app-title" style={{ marginBottom: 4 }}>
        Говоріння
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        Практика вимови й короткі діалоги з голосовим розпізнаванням у браузері.
      </p>

      <div className="chip-row">
        <button className={`chip ${audience === 'general' ? 'active' : ''}`} onClick={() => setAudience('general')}>
          Підлітки й дорослі
        </button>
        <button className={`chip ${audience === 'kids' ? 'active' : ''}`} onClick={() => setAudience('kids')}>
          🧸 Для дітей 7-10
        </button>
      </div>

      {!sttSupported && (
        <div className="explanation" style={{ marginBottom: 16 }}>
          ⚠️ Голосове розпізнавання підтримує лише Chrome/Edge. У інших браузерах можна слухати приклади й відповідати текстом.
        </div>
      )}

      <button className="card" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 14 }} onClick={() => setView({ mode: 'pronunciation' })}>
        <div className="card-topline">
          <span>🎤 Тренажер вимови</span>
        </div>
        <div className="card-prompt" style={{ fontSize: 16, marginBottom: 4 }}>
          {audience === 'kids' ? 'Прості слова для малят' : 'Скоромовки та фрази-пастки'}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          {Object.keys(state.pronunciationBestScores).length}/{PRONUNCIATION_ITEMS.length} відпрацьовано загалом · {pronunciationCount} у цьому режимі
        </div>
      </button>

      <div className="section-title">Діалоги</div>
      {dialogues.map((d) => {
        const done = state.dialoguesCompleted.includes(d.id)
        return (
          <button key={d.id} className="card" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 12 }} onClick={() => setView({ mode: 'dialogue', dialogue: d })}>
            <div className="card-topline">
              <span>
                {d.emoji} {d.title}
              </span>
              {done && <span className="pill-tiny">пройдено</span>}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{d.description}</div>
          </button>
        )
      })}
    </div>
  )
}
