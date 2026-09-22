export interface PronunciationItem {
  id: string
  phrase: string
  translation: string
  tip: string
  /** kids — прості одиночні слова для дітей 7-10 років, general — фрази для підлітків/дорослих */
  audience: 'kids' | 'general'
}

// Фрази, що часто спричиняють проблеми з вимовою в україномовних/російськомовних учнів.
export const PRONUNCIATION_ITEMS: PronunciationItem[] = [
  { id: 'p1', phrase: 'This is a business deal', translation: 'Це ділова угода', tip: 'th — язик між зубами, не "з" і не "с"', audience: 'general' },
  { id: 'p2', phrase: 'The weather is wonderful today', translation: 'Сьогодні чудова погода', tip: 'w ≠ в: губи округлені, без контакту із зубами', audience: 'general' },
  { id: 'p3', phrase: 'I really appreciate your help', translation: 'Я дуже ціную вашу допомогу', tip: 'наголос на APP-ree-shi-eit', audience: 'general' },
  { id: 'p4', phrase: 'Could you repeat that, please', translation: 'Не могли б ви повторити', tip: 'could you часто зливається в "couldja"', audience: 'general' },
  { id: 'p5', phrase: 'She sells seashells by the seashore', translation: 'скоромовка для s/sh', tip: 's і sh — різні звуки, не змішуйте', audience: 'general' },
  { id: 'p6', phrase: 'Thirty three thousand thoughts', translation: 'тренування th', tip: 'th глухий: кінчик язика легко торкається зубів', audience: 'general' },
  { id: 'p7', phrase: 'I have never been there before', translation: 'Я ніколи там не був', tip: 'never — наголос на NE, коротке e', audience: 'general' },
  { id: 'p8', phrase: "Let's get straight to the point", translation: 'Перейдімо одразу до суті', tip: 'straight — один склад, не "стрейт-т"', audience: 'general' },

  // ---------- Для дітей 7-10 років: прості одиночні слова ----------
  { id: 'kp1', phrase: 'Cat', translation: 'Кіт', tip: 'коротке "е", наче "кет", а не "кат"', audience: 'kids' },
  { id: 'kp2', phrase: 'Dog', translation: 'Собака', tip: 'звук "о" короткий, майже "дааг"', audience: 'kids' },
  { id: 'kp3', phrase: 'Elephant', translation: 'Слон', tip: 'наголос на перший склад: ЕЛ-е-фант', audience: 'kids' },
  { id: 'kp4', phrase: 'Red', translation: 'Червоний', tip: 'коротке "е", як в слові "рек"', audience: 'kids' },
  { id: 'kp5', phrase: 'Blue', translation: 'Синій', tip: 'довге "у", губи трубочкою: "блуу"', audience: 'kids' },
  { id: 'kp6', phrase: 'Apple', translation: 'Яблуко', tip: 'наголос на перший склад: ЕП-л', audience: 'kids' },
  { id: 'kp7', phrase: 'School', translation: 'Школа', tip: 'довге "у": "скуул"', audience: 'kids' },
  { id: 'kp8', phrase: 'Mother', translation: 'Мама', tip: 'th звучить м\'яко, язик торкається зубів', audience: 'kids' },
  { id: 'kp9', phrase: 'Father', translation: 'Тато', tip: 'th як у "mother", а не "ф"', audience: 'kids' },
  { id: 'kp10', phrase: 'Sun', translation: 'Сонце', tip: 'коротке "а": "сан", не "сун"', audience: 'kids' },
  { id: 'kp11', phrase: 'Good morning', translation: 'Доброго ранку', tip: 'посміхнись, коли кажеш — звучатиме веселіше!', audience: 'kids' },
  { id: 'kp12', phrase: 'Thank you', translation: 'Дякую', tip: 'th — язичок між зубками, як зміючка', audience: 'kids' },
]
