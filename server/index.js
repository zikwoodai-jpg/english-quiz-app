const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const {
  getCategories,
  getQuestions,
  saveQuestions,
  getLeaderboard,
  saveLeaderboard,
  getChallenges,
  saveChallenges,
} = require('./store')
const { validateQuestion } = require('./validate')

function cleanName(name) {
  return String(name ?? '')
    .trim()
    .slice(0, 30) || 'Анонім'
}

// Locally, API_PORT keeps this server off the frontend dev server's own PORT env var.
// In production (Render etc.) there's no separate frontend process, so we bind to PORT directly.
const PORT = process.env.NODE_ENV === 'production' ? process.env.PORT || 8787 : process.env.API_PORT || 8787
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-admin-token'
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_TOKEN) {
  console.warn('[server] WARNING: ADMIN_TOKEN is not set — falling back to the insecure default. Set it in your hosting dashboard.')
}

const app = express()
app.use(cors())
app.use(express.json())

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token')
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-admin-token header' })
  }
  next()
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.get('/api/categories', (_req, res) => {
  res.json(getCategories())
})

app.get('/api/questions', (req, res) => {
  const { category } = req.query
  const all = getQuestions()
  const filtered = category ? all.filter((q) => q.category === category) : all
  res.json(filtered)
})

app.post('/api/questions', requireAdmin, (req, res) => {
  const errors = validateQuestion(req.body)
  if (errors.length) return res.status(400).json({ errors })

  const questions = getQuestions()
  const id = req.body.id || crypto.randomUUID()
  if (questions.some((q) => q.id === id)) {
    return res.status(409).json({ error: `Question with id "${id}" already exists` })
  }

  const newQuestion = { ...req.body, id }
  questions.push(newQuestion)
  saveQuestions(questions)
  res.status(201).json(newQuestion)
})

app.put('/api/questions/:id', requireAdmin, (req, res) => {
  const errors = validateQuestion(req.body, { partial: true })
  if (errors.length) return res.status(400).json({ errors })

  const questions = getQuestions()
  const idx = questions.findIndex((q) => q.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: `Question "${req.params.id}" not found` })

  questions[idx] = { ...questions[idx], ...req.body, id: req.params.id }
  saveQuestions(questions)
  res.json(questions[idx])
})

app.delete('/api/questions/:id', requireAdmin, (req, res) => {
  const questions = getQuestions()
  const idx = questions.findIndex((q) => q.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: `Question "${req.params.id}" not found` })

  const [removed] = questions.splice(idx, 1)
  saveQuestions(questions)
  res.json(removed)
})

// ---------- Leaderboard ----------

app.get('/api/leaderboard', (_req, res) => {
  const entries = getLeaderboard()
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
  res.json(entries)
})

app.post('/api/leaderboard', (req, res) => {
  const { deviceId, name, score, totalAnswered, totalCorrect, streak, level } = req.body ?? {}
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: '"deviceId" is required' })
  }
  if (!Number.isFinite(score)) {
    return res.status(400).json({ error: '"score" must be a number' })
  }

  const entries = getLeaderboard()
  const idx = entries.findIndex((e) => e.deviceId === deviceId)
  const entry = {
    deviceId,
    name: cleanName(name),
    score: Math.max(0, Math.round(score)),
    totalAnswered: Number.isFinite(totalAnswered) ? totalAnswered : 0,
    totalCorrect: Number.isFinite(totalCorrect) ? totalCorrect : 0,
    streak: Number.isFinite(streak) ? streak : 0,
    level: typeof level === 'string' ? level : null,
    updatedAt: new Date().toISOString(),
  }

  if (idx === -1) entries.push(entry)
  else entries[idx] = entry

  saveLeaderboard(entries)
  res.json(entry)
})

// ---------- Challenges ----------
// Легкий "виклик другу": хтось створює ціль (напр. 50 правильних відповідей),
// ділиться коротким кодом (id), інші приєднуються й синхронізують прогрес.

app.get('/api/challenges/:id', (req, res) => {
  const challenge = getChallenges().find((c) => c.id === req.params.id)
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' })
  res.json(challenge)
})

app.post('/api/challenges', (req, res) => {
  const { title, targetType, targetValue, creatorDeviceId, creatorName } = req.body ?? {}
  const validTargetTypes = new Set(['correct_answers', 'streak_days'])

  if (!validTargetTypes.has(targetType)) {
    return res.status(400).json({ error: `"targetType" must be one of ${[...validTargetTypes].join(', ')}` })
  }
  if (!Number.isFinite(targetValue) || targetValue <= 0) {
    return res.status(400).json({ error: '"targetValue" must be a positive number' })
  }
  if (!creatorDeviceId || typeof creatorDeviceId !== 'string') {
    return res.status(400).json({ error: '"creatorDeviceId" is required' })
  }

  const challenge = {
    id: crypto.randomUUID().slice(0, 8),
    title: String(title ?? '').trim().slice(0, 60) || 'Виклик друзям',
    targetType,
    targetValue: Math.round(targetValue),
    createdAt: new Date().toISOString(),
    participants: [{ deviceId: creatorDeviceId, name: cleanName(creatorName), progress: 0, joinedAt: new Date().toISOString() }],
  }

  const challenges = getChallenges()
  challenges.push(challenge)
  saveChallenges(challenges)
  res.status(201).json(challenge)
})

app.post('/api/challenges/:id/join', (req, res) => {
  const { deviceId, name } = req.body ?? {}
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: '"deviceId" is required' })
  }

  const challenges = getChallenges()
  const challenge = challenges.find((c) => c.id === req.params.id)
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

  if (!challenge.participants.some((p) => p.deviceId === deviceId)) {
    challenge.participants.push({ deviceId, name: cleanName(name), progress: 0, joinedAt: new Date().toISOString() })
    saveChallenges(challenges)
  }
  res.json(challenge)
})

app.post('/api/challenges/:id/progress', (req, res) => {
  const { deviceId, progress } = req.body ?? {}
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ error: '"deviceId" is required' })
  }
  if (!Number.isFinite(progress)) {
    return res.status(400).json({ error: '"progress" must be a number' })
  }

  const challenges = getChallenges()
  const challenge = challenges.find((c) => c.id === req.params.id)
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

  const participant = challenge.participants.find((p) => p.deviceId === deviceId)
  if (!participant) return res.status(404).json({ error: 'Not a participant of this challenge — join it first' })

  participant.progress = Math.max(0, Math.round(progress))
  saveChallenges(challenges)
  res.json(challenge)
})

// ---------- Serve the built frontend in production ----------
// One Render/Railway web service hosts the API and both static pages (index.html + admin.html).
const DIST_DIR = path.join(__dirname, '..', 'dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/^\/admin(\/.*)?$/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'admin.html')))
  // SPA fallback for the phone app — anything else that isn't /api/* serves index.html.
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] QuizEnglish API listening on http://localhost:${PORT}`)
})
