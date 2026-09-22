import type { CategoryMeta, Question } from '../types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-admin-token': token } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = body.errors ? body.errors.join('; ') : body.error || `HTTP ${res.status}`
    throw new ApiError(res.status, message)
  }
  return res.json()
}

export const getQuestions = () => request<Question[]>('/api/questions')
export const getCategories = () => request<CategoryMeta[]>('/api/categories')

export const createQuestion = (token: string, data: Omit<Question, 'id'>) =>
  request<Question>('/api/questions', { method: 'POST', body: JSON.stringify(data) }, token)

export const updateQuestion = (token: string, id: string, data: Omit<Question, 'id'>) =>
  request<Question>(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token)

export const deleteQuestion = (token: string, id: string) =>
  request<Question>(`/api/questions/${id}`, { method: 'DELETE' }, token)
