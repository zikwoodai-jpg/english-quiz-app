export type Category =
  | 'vocabulary'
  | 'false_friends'
  | 'phrasal_verbs'
  | 'idioms'
  | 'grammar_traps'
  | 'synonyms'
  | 'ielts'
  | 'kids'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Question {
  id: string
  category: Category
  level: Level
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface CategoryMeta {
  id: Category
  title: string
  emoji: string
  description: string
}

export interface VocabEntry {
  questionId: string
  word: string
  translation: string
  /** true для слів, доданих вручну через "Мої колоди", а не з помилок у стрічці */
  custom?: boolean
  /** spaced-repetition state (simplified SM-2) */
  interval: number
  repetitions: number
  easeFactor: number
  dueAt: number
  lastResult: 'again' | 'good' | null
}

export interface AppState {
  onboardingDone: boolean
  level: Level | null
  streak: number
  lastActiveDay: string | null
  totalAnswered: number
  totalCorrect: number
  answeredIds: string[]
  vocab: Record<string, VocabEntry>
  /** адаптивна складність: скільки поспіль правильних/неправильних відповідей на поточному рівні */
  correctStreak: number
  wrongStreak: number
  /** говоріння: найкращий результат вимови (0-100) по кожній фразі */
  pronunciationBestScores: Record<string, number>
  /** говоріння: id завершених діалогів */
  dialoguesCompleted: string[]
}
