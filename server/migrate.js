const fs = require('fs')
const path = require('path')
const { query } = require('./db')

const SEED_QUESTIONS_PATH = path.join(__dirname, 'data', 'questions.json')
const SEED_CATEGORIES_PATH = path.join(__dirname, 'data', 'categories.json')

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      emoji TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      prompt TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT NOT NULL
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      device_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      total_answered INTEGER NOT NULL DEFAULT 0,
      total_correct INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      level TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      participants JSONB NOT NULL DEFAULT '[]'
    )
  `)
}

async function seedIfEmpty() {
  const { rows: catCount } = await query('SELECT COUNT(*)::int AS count FROM categories')
  if (catCount[0].count === 0) {
    const categories = JSON.parse(fs.readFileSync(SEED_CATEGORIES_PATH, 'utf8'))
    for (const c of categories) {
      await query('INSERT INTO categories (id, title, emoji, description) VALUES ($1, $2, $3, $4)', [c.id, c.title, c.emoji, c.description])
    }
    console.log(`[migrate] Seeded ${categories.length} categories`)
  }

  const { rows: qCount } = await query('SELECT COUNT(*)::int AS count FROM questions')
  if (qCount[0].count === 0) {
    const questions = JSON.parse(fs.readFileSync(SEED_QUESTIONS_PATH, 'utf8'))
    for (const q of questions) {
      await query(
        'INSERT INTO questions (id, category, level, prompt, options, correct_index, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [q.id, q.category, q.level, q.prompt, JSON.stringify(q.options), q.correctIndex, q.explanation],
      )
    }
    console.log(`[migrate] Seeded ${questions.length} questions`)
  }
}

async function runMigrations() {
  await createTables()
  await seedIfEmpty()
}

module.exports = { runMigrations }
