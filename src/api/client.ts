import type { CategoryMeta, Question } from '../types'

export async function fetchQuestions(): Promise<Question[]> {
  const res = await fetch('/api/questions')
  if (!res.ok) throw new Error(`GET /api/questions failed: ${res.status}`)
  return res.json()
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error(`GET /api/categories failed: ${res.status}`)
  return res.json()
}
