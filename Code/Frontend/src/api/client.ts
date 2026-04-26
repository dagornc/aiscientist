import type { Idea, Experiment, Paper, Review, PipelineRun, StatsData, AppSettings } from "../types";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

// Idea API
export const IdeaApi = {
  getAll: () => request<Idea[]>("/ideas/"),
  getById: (id: string) => request<Idea>(`/ideas/${id}`),
  generate: (domain: string, numIdeas: number) =>
    request<Idea[]>("/ideas/generate", {
      method: "POST",
      body: JSON.stringify({ research_area: domain, num_ideas: numIdeas }),
    }),
};

// Experiment API
export const ExperimentApi = {
  getAll: () => request<Experiment[]>("/experiments/"),
  getById: (id: string) => request<Experiment>(`/experiments/${id}`),
  run: (ideaId: string, timeout?: number) =>
    request<Experiment>("/experiments/run", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId, timeout }),
    }),
};

// Paper API
export const PaperApi = {
  getAll: () => request<Paper[]>("/papers/"),
  getById: (id: string) => request<Paper>(`/papers/${id}`),
  write: (ideaId: string, experimentId: string, template?: string) =>
    request<Paper>("/papers/write", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId, experiment_id: experimentId, template }),
    }),
};

// Review API
export const ReviewApi = {
  getAll: () => request<Review[]>("/reviews/"),
  getById: (id: string) => request<Review>(`/reviews/${id}`),
  review: (paperId: string, numReflections?: number, temperature?: number) =>
    request<Review>("/reviews/review", {
      method: "POST",
      body: JSON.stringify({ paper_id: paperId, num_reflections: numReflections, temperature }),
    }),
};

// Pipeline API
export const PipelineApi = {
  start: (domain: string, maxIterations?: number) =>
    request<{ run_id: string; status: string }>("/pipeline/run", {
      method: "POST",
      body: JSON.stringify({ domain, max_iterations: maxIterations || 3 }),
    }),
  getStatus: (runId: string) =>
    request<PipelineRun>(`/pipeline/${runId}/status`),
  getGraph: () =>
    request<{ nodes: unknown[]; edges: unknown[] }>("/pipeline/graph"),
};

// Models API
export const ModelsApi = {
  list: () => request<{ providers: string[]; current: { provider: string; model: string } }>("/models/"),
};

// Stats API
export const StatsApi = {
  getStats: () => request<StatsData>("/stats"),
};

// Health API
export const HealthApi = {
  check: () => request<{ status: string; version: string }>("/health"),
};

// Config API
export const ConfigApi = {
  get: () => request<AppSettings>("/config"),
  save: (config: AppSettings) =>
    request<AppSettings>("/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
};
