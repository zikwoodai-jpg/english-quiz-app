const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('[db] WARNING: DATABASE_URL is not set — the server will crash on first query.')
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
})

async function query(text, params) {
  return pool.query(text, params)
}

module.exports = { pool, query }
