import { useState } from 'react'
import { Leaderboard } from './Leaderboard'
import { Challenges } from './Challenges'
import { ShareCard } from './ShareCard'

type SubTab = 'leaderboard' | 'challenges' | 'share'

export function Social() {
  const [sub, setSub] = useState<SubTab>('leaderboard')

  return (
    <div className="screen">
      <div className="app-title" style={{ marginBottom: 4 }}>
        Змагання
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        Рейтинг, виклики з друзями й картка для шеру прогресу.
      </p>

      <div className="chip-row">
        <button className={`chip ${sub === 'leaderboard' ? 'active' : ''}`} onClick={() => setSub('leaderboard')}>
          🏆 Рейтинг
        </button>
        <button className={`chip ${sub === 'challenges' ? 'active' : ''}`} onClick={() => setSub('challenges')}>
          🤝 Виклики
        </button>
        <button className={`chip ${sub === 'share' ? 'active' : ''}`} onClick={() => setSub('share')}>
          📤 Поділитись
        </button>
      </div>

      {sub === 'leaderboard' && <Leaderboard />}
      {sub === 'challenges' && <Challenges />}
      {sub === 'share' && <ShareCard />}
    </div>
  )
}
