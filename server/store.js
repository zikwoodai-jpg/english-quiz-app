const fs = require('fs')
const path = require('path')

const QUESTIONS_PATH = path.join(__dirname, 'data', 'questions.json')
const CATEGORIES_PATH = path.join(__dirname, 'data', 'categories.json')
const LEADERBOARD_PATH = path.join(__dirname, 'data', 'leaderboard.json')
const CHALLENGES_PATH = path.join(__dirname, 'data', 'challenges.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function getCategories() {
  return readJson(CATEGORIES_PATH)
}

function getQuestions() {
  return readJson(QUESTIONS_PATH)
}

function saveQuestions(questions) {
  writeJson(QUESTIONS_PATH, questions)
}

function getLeaderboard() {
  return readJson(LEADERBOARD_PATH)
}

function saveLeaderboard(entries) {
  writeJson(LEADERBOARD_PATH, entries)
}

function getChallenges() {
  return readJson(CHALLENGES_PATH)
}

function saveChallenges(challenges) {
  writeJson(CHALLENGES_PATH, challenges)
}

module.exports = {
  getCategories,
  getQuestions,
  saveQuestions,
  getLeaderboard,
  saveLeaderboard,
  getChallenges,
  saveChallenges,
}
