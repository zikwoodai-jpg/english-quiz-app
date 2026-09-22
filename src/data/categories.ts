import type { CategoryMeta } from '../types'

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'vocabulary',
    title: 'Vocabulary by topic',
    emoji: '📚',
    description: 'Слова за темами: бізнес, подорожі, техно, їжа',
  },
  {
    id: 'false_friends',
    title: 'False Friends',
    emoji: '🎭',
    description: 'Слова, що звучать знайомо, але означають інше',
  },
  {
    id: 'phrasal_verbs',
    title: 'Phrasal Verbs',
    emoji: '🔗',
    description: 'get up / get over / get away',
  },
  {
    id: 'idioms',
    title: 'Idioms',
    emoji: '💬',
    description: 'break the ice, hit the books',
  },
  {
    id: 'grammar_traps',
    title: 'Grammar Traps',
    emoji: '⚠️',
    description: 'who vs whom, less vs fewer',
  },
  {
    id: 'synonyms',
    title: 'Synonyms Upgrade',
    emoji: '⬆️',
    description: 'good → remarkable',
  },
  {
    id: 'ielts',
    title: 'IELTS/EGE шаблони',
    emoji: '🎓',
    description: 'готові фрази для speaking/writing',
  },
  {
    id: 'kids',
    title: 'English for Kids',
    emoji: '🧸',
    description: 'Прості слова для дітей 7-10 років: тварини, кольори, родина',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
