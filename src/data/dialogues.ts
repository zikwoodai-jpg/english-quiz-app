export interface DialogueStep {
  id: string
  npcLine: string
  npcTranslation: string
  /** будь-яка з цих фраз/слів у відповіді користувача вважається прийнятною */
  expectedPhrases: string[]
  hint: string
}

export interface Dialogue {
  id: string
  title: string
  emoji: string
  description: string
  steps: DialogueStep[]
  /** kids — прості короткі діалоги для дітей 7-10 років, general — для підлітків/дорослих */
  audience: 'kids' | 'general'
}

export const DIALOGUES: Dialogue[] = [
  {
    id: 'coffee',
    title: 'У кав\'ярні',
    emoji: '☕',
    description: 'Замовте каву й дрібну розмову з бариста',
    audience: 'general',
    steps: [
      {
        id: 'c1',
        npcLine: 'Hi! What can I get you today?',
        npcTranslation: 'Привіт! Що для вас?',
        expectedPhrases: ['i would like', 'i will have', 'can i get', 'i want', 'a coffee', 'coffee please'],
        hint: 'I would like a coffee, please',
      },
      {
        id: 'c2',
        npcLine: 'Sure. For here or to go?',
        npcTranslation: 'Тут чи із собою?',
        expectedPhrases: ['to go', 'for here', 'here please', 'to go please'],
        hint: 'To go, please',
      },
      {
        id: 'c3',
        npcLine: 'That will be five dollars. Anything else?',
        npcTranslation: 'З вас пʼять доларів. Ще щось?',
        expectedPhrases: ['no thanks', 'no thank you', 'that is all', 'nothing else', 'thats it'],
        hint: 'No, thank you, that\'s all',
      },
    ],
  },
  {
    id: 'intro',
    title: 'Знайомство',
    emoji: '👋',
    description: 'Розкажіть трохи про себе новому знайомому',
    audience: 'general',
    steps: [
      {
        id: 'i1',
        npcLine: 'Hi there, I don\'t think we\'ve met. What\'s your name?',
        npcTranslation: 'Привіт, здається ми не знайомі. Як тебе звати?',
        expectedPhrases: ['my name is', 'i am', "i'm"],
        hint: 'My name is ... / I\'m ...',
      },
      {
        id: 'i2',
        npcLine: 'Nice to meet you! Where are you from?',
        npcTranslation: 'Приємно познайомитись! Звідки ти?',
        expectedPhrases: ['i am from', "i'm from", 'from ukraine'],
        hint: 'I\'m from Ukraine',
      },
      {
        id: 'i3',
        npcLine: 'Cool! What do you do for work?',
        npcTranslation: 'Круто! Ким ти працюєш?',
        expectedPhrases: ['i work as', 'i am a', "i'm a", 'i study'],
        hint: 'I work as a ... / I\'m a student',
      },
    ],
  },
  {
    id: 'directions',
    title: 'Запитати дорогу',
    emoji: '🗺️',
    description: 'Спитайте, як дістатись до потрібного місця',
    audience: 'general',
    steps: [
      {
        id: 'd1',
        npcLine: 'Excuse me, can I help you with something?',
        npcTranslation: 'Перепрошую, я можу чимось допомогти?',
        expectedPhrases: ['excuse me', 'yes', 'could you tell me', 'how do i get'],
        hint: 'Excuse me, how do I get to the station?',
      },
      {
        id: 'd2',
        npcLine: 'Sure, go straight and turn left at the corner.',
        npcTranslation: 'Звісно, ідіть прямо і поверніть ліворуч на розі.',
        expectedPhrases: ['thank you', 'thanks', 'is it far', 'how far'],
        hint: 'Thank you! Is it far from here?',
      },
      {
        id: 'd3',
        npcLine: 'Not at all, just five minutes away.',
        npcTranslation: 'Зовсім ні, лише пʼять хвилин.',
        expectedPhrases: ['thank you', 'thanks', 'have a good day', 'appreciate it'],
        hint: 'Thank you so much, have a nice day!',
      },
    ],
  },

  // ---------- Для дітей 7-10 років: короткі й прості діалоги ----------
  {
    id: 'kid-playground',
    title: 'На майданчику',
    emoji: '🛝',
    description: 'Познайомся з новим другом на майданчику',
    audience: 'kids',
    steps: [
      {
        id: 'kp1',
        npcLine: 'Hi! What is your name?',
        npcTranslation: 'Привіт! Як тебе звати?',
        expectedPhrases: ['my name is', 'i am', "i'm"],
        hint: 'My name is ...',
      },
      {
        id: 'kp2',
        npcLine: 'How old are you?',
        npcTranslation: 'Скільки тобі років?',
        expectedPhrases: ['i am', "i'm", 'years old', 'seven', 'eight', 'nine', 'ten'],
        hint: 'I am 8 years old',
      },
      {
        id: 'kp3',
        npcLine: 'Do you want to play?',
        npcTranslation: 'Хочеш погратись?',
        expectedPhrases: ['yes', 'sure', 'i want', 'lets play', "let's play"],
        hint: 'Yes, let\'s play!',
      },
    ],
  },
  {
    id: 'kid-zoo',
    title: 'У зоопарку',
    emoji: '🦁',
    description: 'Назви тварин, яких бачиш у зоопарку',
    audience: 'kids',
    steps: [
      {
        id: 'kz1',
        npcLine: 'Look! What animal is this?',
        npcTranslation: 'Дивись! Що це за тварина?',
        expectedPhrases: ['it is a lion', "it's a lion", 'lion', 'a lion'],
        hint: 'It is a lion',
      },
      {
        id: 'kz2',
        npcLine: 'Wow! And what is your favorite animal?',
        npcTranslation: 'Ого! А яка твоя улюблена тварина?',
        expectedPhrases: ['my favorite animal is', 'i like', 'i love'],
        hint: 'My favorite animal is the elephant',
      },
      {
        id: 'kz3',
        npcLine: 'That is a great choice! Is it big or small?',
        npcTranslation: 'Чудовий вибір! Вона велика чи маленька?',
        expectedPhrases: ['it is big', "it's big", 'big', 'it is small', 'small'],
        hint: 'It is big',
      },
    ],
  },
  {
    id: 'kid-birthday',
    title: 'День народження',
    emoji: '🎂',
    description: 'Прийми запрошення на день народження друга',
    audience: 'kids',
    steps: [
      {
        id: 'kb1',
        npcLine: 'It is my birthday on Saturday! Can you come?',
        npcTranslation: 'У суботу мій день народження! Ти прийдеш?',
        expectedPhrases: ['yes', 'i can come', 'sure', "i'd love to", 'i would love to'],
        hint: 'Yes, I can come!',
      },
      {
        id: 'kb2',
        npcLine: 'Great! What is your favorite color for a present?',
        npcTranslation: 'Чудово! Який твій улюблений колір для подарунка?',
        expectedPhrases: ['my favorite color is', 'i like', 'blue', 'red', 'green', 'pink'],
        hint: 'My favorite color is blue',
      },
      {
        id: 'kb3',
        npcLine: 'Perfect! See you on Saturday!',
        npcTranslation: 'Чудово! До зустрічі в суботу!',
        expectedPhrases: ['see you', 'bye', 'thank you', 'thanks'],
        hint: 'See you! Thank you!',
      },
    ],
  },
]
