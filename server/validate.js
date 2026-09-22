const VALID_CATEGORIES = new Set([
  'vocabulary',
  'false_friends',
  'phrasal_verbs',
  'idioms',
  'grammar_traps',
  'synonyms',
  'ielts',
  'kids',
])
const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced'])

function validateQuestion(body, { partial = false } = {}) {
  const errors = []
  const required = (key, check) => {
    if (body[key] === undefined) {
      if (!partial) errors.push(`"${key}" is required`)
      return
    }
    check()
  }

  required('category', () => {
    if (!VALID_CATEGORIES.has(body.category)) errors.push(`"category" must be one of ${[...VALID_CATEGORIES].join(', ')}`)
  })
  required('level', () => {
    if (!VALID_LEVELS.has(body.level)) errors.push(`"level" must be one of ${[...VALID_LEVELS].join(', ')}`)
  })
  required('prompt', () => {
    if (typeof body.prompt !== 'string' || !body.prompt.trim()) errors.push('"prompt" must be a non-empty string')
  })
  required('options', () => {
    if (!Array.isArray(body.options) || body.options.length < 2 || body.options.some((o) => typeof o !== 'string' || !o.trim())) {
      errors.push('"options" must be an array of at least 2 non-empty strings')
    }
  })
  required('correctIndex', () => {
    if (!Number.isInteger(body.correctIndex) || body.correctIndex < 0 || (Array.isArray(body.options) && body.correctIndex >= body.options.length)) {
      errors.push('"correctIndex" must be a valid index into "options"')
    }
  })
  required('explanation', () => {
    if (typeof body.explanation !== 'string' || !body.explanation.trim()) errors.push('"explanation" must be a non-empty string')
  })

  return errors
}

module.exports = { validateQuestion, VALID_CATEGORIES, VALID_LEVELS }
