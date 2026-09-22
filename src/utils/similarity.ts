function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}

/**
 * Наближена оцінка "вимови" (0-100): наскільки розпізнаний STT-транскрипт
 * збігається з цільовим текстом. Це проксі-метрика через якість розпізнавання
 * мовлення браузером, а не справжній фонетичний аналіз аудіо.
 */
export function pronunciationScore(target: string, heard: string): number {
  const a = normalize(target)
  const b = normalize(heard)
  if (!a || !b) return 0
  const distance = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  return Math.max(0, Math.round((1 - distance / maxLen) * 100))
}

/** Чи трапилась хоч одна з очікуваних фраз/ключових слів у розпізнаному тексті. */
export function containsAnyPhrase(heard: string, phrases: string[]): boolean {
  const normalizedHeard = normalize(heard)
  return phrases.some((phrase) => normalizedHeard.includes(normalize(phrase)))
}
