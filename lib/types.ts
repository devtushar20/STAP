export type Theme = "light" | "dark";

export interface ProblemItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  width: number;
  height: number;
}

export interface PipelineStep {
  step: string;
  title: string;
  description: string;
  icon: string;
  width: number;
  height: number;
}

export interface SolutionStep {
  step: string;
  title: string;
  description: string;
  icon: string;
  width: number;
  height: number;
}

export interface AgentItem {
  id: "L1" | "L2" | "L3" | "R1" | "R2" | "R3";
  name: string;
  role: string;
  description: string;
  icon: string;
  width: number;
  height: number;
}

export interface PricingTier {
  id: string;
  tierNumber: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "dark" | "outline";
  isPopular?: boolean;
  actionType: "demo" | "sales";
}

// API Responses for the Python FastAPI Backend

export interface DemoRequestPayload {
  mode?: "demo" | "sales";
  name: string;
  email: string;
  company: string;
  team_size: string;
  message?: string;
}

export interface DemoRequestResponse {
  status: "success" | "error";
  message: string;
  id?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: "success" | "error";
  token?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface DashboardSummaryResponse {
  jobs: number;
  candidates: number;
  shortlisted: number;
  interviews: number;
}

export interface DashboardPipelineStage {
  stage: string;
  count: number;
  percentage?: number;
}

export interface DashboardPipelineResponse {
  applied: number;
  screening: number;
  interview: number;
  evaluation: number;
  offer: number;
  percentages: {
    applied: number;
    screening: number;
    interview: number;
  };
}

export interface AgentActivityItem {
  name: string;
  status: string;
  count?: string;
  statusType: "active" | "processing" | "completed";
}

export interface DashboardAgentsResponse {
  agents: AgentActivityItem[];
}

export interface CandidateItem {
  id: string;
  name: string;
  role: string;
  matchPercentage: number;
}

export interface DashboardCandidatesResponse {
  candidates: CandidateItem[];
}

