const { query } = require('./db')

function questionRowToJson(row) {
  return {
    id: row.id,
    category: row.category,
    level: row.level,
    prompt: row.prompt,
    options: row.options,
    correctIndex: row.correct_index,
    explanation: row.explanation,
  }
}

function leaderboardRowToJson(row) {
  return {
    deviceId: row.device_id,
    name: row.name,
    score: row.score,
    totalAnswered: row.total_answered,
    totalCorrect: row.total_correct,
    streak: row.streak,
    level: row.level,
    updatedAt: row.updated_at,
  }
}

function challengeRowToJson(row) {
  return {
    id: row.id,
    title: row.title,
    targetType: row.target_type,
    targetValue: row.target_value,
    createdAt: row.created_at,
    participants: row.participants,
  }
}

// ---------- Categories ----------

async function getCategories() {
  const { rows } = await query('SELECT * FROM categories ORDER BY id')
  return rows
}

// ---------- Questions ----------

async function getQuestions() {
  const { rows } = await query('SELECT * FROM questions ORDER BY id')
  return rows.map(questionRowToJson)
}

async function insertQuestion(q) {
  await query(
    'INSERT INTO questions (id, category, level, prompt, options, correct_index, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [q.id, q.category, q.level, q.prompt, JSON.stringify(q.options), q.correctIndex, q.explanation],
  )
}

async function updateQuestion(id, q) {
  const { rows } = await query(
    `UPDATE questions SET category = $2, level = $3, prompt = $4, options = $5, correct_index = $6, explanation = $7
     WHERE id = $1 RETURNING *`,
    [id, q.category, q.level, q.prompt, JSON.stringify(q.options), q.correctIndex, q.explanation],
  )
  return rows[0] ? questionRowToJson(rows[0]) : null
}

async function deleteQuestion(id) {
  const { rows } = await query('DELETE FROM questions WHERE id = $1 RETURNING *', [id])
  return rows[0] ? questionRowToJson(rows[0]) : null
}

async function questionExists(id) {
  const { rows } = await query('SELECT 1 FROM questions WHERE id = $1', [id])
  return rows.length > 0
}

// ---------- Leaderboard ----------

async function getLeaderboard() {
  const { rows } = await query('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 50')
  return rows.map(leaderboardRowToJson)
}

async function upsertLeaderboardEntry(entry) {
  const { rows } = await query(
    `INSERT INTO leaderboard (device_id, name, score, total_answered, total_correct, streak, level, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (device_id) DO UPDATE SET
       name = EXCLUDED.name, score = EXCLUDED.score, total_answered = EXCLUDED.total_answered,
       total_correct = EXCLUDED.total_correct, streak = EXCLUDED.streak, level = EXCLUDED.level, updated_at = now()
     RETURNING *`,
    [entry.deviceId, entry.name, entry.score, entry.totalAnswered, entry.totalCorrect, entry.streak, entry.level],
  )
  return leaderboardRowToJson(rows[0])
}

// ---------- Challenges ----------

async function getChallenge(id) {
  const { rows } = await query('SELECT * FROM challenges WHERE id = $1', [id])
  return rows[0] ? challengeRowToJson(rows[0]) : null
}

async function insertChallenge(challenge) {
  const { rows } = await query(
    'INSERT INTO challenges (id, title, target_type, target_value, participants) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [challenge.id, challenge.title, challenge.targetType, challenge.targetValue, JSON.stringify(challenge.participants)],
  )
  return challengeRowToJson(rows[0])
}

async function saveChallengeParticipants(id, participants) {
  const { rows } = await query('UPDATE challenges SET participants = $2 WHERE id = $1 RETURNING *', [id, JSON.stringify(participants)])
  return rows[0] ? challengeRowToJson(rows[0]) : null
}

module.exports = {
  getCategories,
  getQuestions,
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  questionExists,
  getLeaderboard,
  upsertLeaderboardEntry,
  getChallenge,
  insertChallenge,
  saveChallengeParticipants,
}
