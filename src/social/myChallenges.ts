const KEY = 'quiz-english-my-challenges'

export function getMyChallengeIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addMyChallengeId(id: string): void {
  const ids = getMyChallengeIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(KEY, JSON.stringify(ids))
  }
}
