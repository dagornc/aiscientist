// AI Scientist Application Types — aligned with backend Pydantic models

export type IdeaStatus = 'new' | 'generated' | 'novelty_checked' | 'selected' | 'in_progress' | 'completed' | 'rejected';
export type ExperimentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type PaperStatus = 'draft' | 'completed' | 'reviewed_accepted' | 'reviewed_rejected' | 'revision_required';
export type ReviewDecision = 'accept' | 'reject' | 'borderline';
export type PipelineStatus = 'idle' | 'queued' | 'running' | 'completed' | 'failed';

export interface Idea {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: IdeaStatus;
  noveltyScore: number;
  feasibilityScore: number;
  impactScore: number;
  keywords: string[];
  relatedWork: string[];
  experimentPlan: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  ideaId: string;
  name: string;
  status: ExperimentStatus;
  progress: number;
  logs: string[];
  results: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Paper {
  id: string;
  ideaId: string;
  experimentId: string;
  title: string;
  status: PaperStatus;
  abstract: string;
  sections: Record<string, string>;
  latexContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  paperId: string;
  overallScore: number;
  decision: ReviewDecision;
  scores: {
    soundness: number;
    presentation: number;
    contribution: number;
    rating: number;
    confidence: number;
  };
  strengths: string[];
  weaknesses: string[];
  comments: string;
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  domain: string;
  status: PipelineStatus;
  progress: number;
  currentStep: string;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  results: {
    ideasCount: number;
    experimentsCount: number;
    papersCount: number;
    reviewsCount: number;
  };
}

export interface PipelineGraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; icon: string };
}

export interface PipelineGraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, string>;
}

export interface LLMConfig {
  provider: string;
  model: string;
  temperature: number;
  baseUrl?: string;
  apiKey?: string;
}

export interface AppSettings {
  llm: LLMConfig;
  theme: 'dark' | 'light';
  locale: 'en' | 'fr';
}

export interface WebSocketMessage {
  type: 'log' | 'progress' | 'status' | 'error';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface StatsData {
  ideasCount: number;
  experimentsCount: number;
  papersCount: number;
  reviewsCount: number;
}
