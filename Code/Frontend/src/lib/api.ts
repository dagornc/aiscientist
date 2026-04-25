const API_BASE = '/api'

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || 'API Error')
  }
  return response.json()
}

export interface Idea {
  id: string
  title: string
  description: string
  novelty_score: number
  feasibility_score: number
  impact_score: number
  status: string
  keywords: string[]
  experiment_plan: string
}

export interface Experiment {
  id: string
  idea_id: string
  status: string
  results: Record<string, unknown>
  execution_time_seconds: number
}

export interface Paper {
  id: string
  idea_id: string
  title: string
  abstract: string
  status: string
}

export interface Review {
  id: string
  paper_id: string
  overall_score: number
  decision: string
  strengths: string[]
  weaknesses: string[]
}

export interface ModelInfo {
  providers: Array<{ id: string; name: string }>
  current: { provider: string; model: string }
}
