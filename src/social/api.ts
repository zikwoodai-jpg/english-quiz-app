export interface LeaderboardEntry {
  deviceId: string
  name: string
  score: number
  totalAnswered: number
  totalCorrect: number
  streak: number
  level: string | null
  updatedAt: string
}

export interface ChallengeParticipant {
  deviceId: string
  name: string
  progress: number
  joinedAt: string
}

export interface Challenge {
  id: string
  title: string
  targetType: 'correct_answers' | 'streak_days'
  targetValue: number
  createdAt: string
  participants: ChallengeParticipant[]
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const getLeaderboard = () => request<LeaderboardEntry[]>('/api/leaderboard')

export const submitScore = (entry: Omit<LeaderboardEntry, 'updatedAt'>) =>
  request<LeaderboardEntry>('/api/leaderboard', { method: 'POST', body: JSON.stringify(entry) })

export const createChallenge = (data: { title: string; targetType: Challenge['targetType']; targetValue: number; creatorDeviceId: string; creatorName: string }) =>
  request<Challenge>('/api/challenges', { method: 'POST', body: JSON.stringify(data) })

export const getChallenge = (id: string) => request<Challenge>(`/api/challenges/${id}`)

export const joinChallenge = (id: string, deviceId: string, name: string) =>
  request<Challenge>(`/api/challenges/${id}/join`, { method: 'POST', body: JSON.stringify({ deviceId, name }) })

export const updateChallengeProgress = (id: string, deviceId: string, progress: number) =>
  request<Challenge>(`/api/challenges/${id}/progress`, { method: 'POST', body: JSON.stringify({ deviceId, progress }) })
