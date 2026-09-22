import { useAppState } from '../store/AppStateContext'

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function Profile() {
  const { state, resetProgress } = useAppState()
  const accuracy = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0

  return (
    <div className="screen">
      <div className="app-title" style={{ marginBottom: 12 }}>
        Профіль
      </div>

      <span className="level-badge">Рівень: {state.level ? LEVEL_LABEL[state.level] : '—'}</span>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">🔥 {state.streak}</div>
          <div className="stat-label">днів поспіль</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{state.totalAnswered}</div>
          <div className="stat-label">відповідей всього</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{accuracy}%</div>
          <div className="stat-label">точність</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(state.vocab).length}</div>
          <div className="stat-label">слів у словнику</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🗣️ {state.dialoguesCompleted.length}</div>
          <div className="stat-label">діалогів пройдено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Object.values(state.pronunciationBestScores).length
              ? Math.round(
                  Object.values(state.pronunciationBestScores).reduce((a, b) => a + b, 0) /
                    Object.values(state.pronunciationBestScores).length,
                )
              : '—'}
            %
          </div>
          <div className="stat-label">середня вимова</div>
        </div>
      </div>

      <div className="section-title">Налаштування</div>
      <button
        className="secondary-btn"
        onClick={() => {
          if (confirm('Скинути весь прогрес? Це не можна відмінити.')) resetProgress()
        }}
      >
        Скинути прогрес
      </button>
    </div>
  )
}
