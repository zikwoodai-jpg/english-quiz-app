import { useMemo, useState } from 'react'
import { AppStateProvider, useAppState } from './store/AppStateContext'
import { QuestionBankProvider } from './store/QuestionBankContext'
import { Onboarding } from './components/Onboarding'
import { Feed } from './components/Feed'
import { Speaking } from './components/Speaking'
import { VocabularyList } from './components/VocabularyList'
import { Social } from './components/Social'
import { Profile } from './components/Profile'
import { BottomNav, type Tab } from './components/BottomNav'
import { isDue } from './utils/srs'

function MainApp() {
  const { state } = useAppState()
  const [tab, setTab] = useState<Tab>('feed')

  const dueCount = useMemo(() => Object.values(state.vocab).filter(isDue).length, [state.vocab])

  if (!state.onboardingDone) {
    return <Onboarding />
  }

  return (
    <>
      <header className="app-header">
        <span className="app-title">📚 QuizEnglish</span>
        <span className="streak-pill">🔥 {state.streak}</span>
      </header>

      {tab === 'feed' && <Feed />}
      {tab === 'speaking' && <Speaking />}
      {tab === 'vocab' && <VocabularyList />}
      {tab === 'social' && <Social />}
      {tab === 'profile' && <Profile />}

      <BottomNav active={tab} onChange={setTab} dueCount={dueCount} />
    </>
  )
}

function App() {
  return (
    <QuestionBankProvider>
      <AppStateProvider>
        <MainApp />
      </AppStateProvider>
    </QuestionBankProvider>
  )
}

export default App
