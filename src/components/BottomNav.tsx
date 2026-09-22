export type Tab = 'feed' | 'speaking' | 'vocab' | 'social' | 'profile'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
  dueCount: number
}

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'feed', icon: '🎴', label: 'Стрічка' },
  { id: 'speaking', icon: '🎤', label: 'Говоріння' },
  { id: 'vocab', icon: '📖', label: 'Словник' },
  { id: 'social', icon: '🏆', label: 'Змагання' },
  { id: 'profile', icon: '👤', label: 'Профіль' },
]

export function BottomNav({ active, onChange, dueCount }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <button key={t.id} className={`nav-btn ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          <span className="nav-icon">
            {t.icon}
            {t.id === 'vocab' && dueCount > 0 && (
              <span style={{ fontSize: 10, color: 'var(--bad)', marginLeft: 2 }}>●</span>
            )}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
