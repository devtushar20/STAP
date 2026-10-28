import {
  DemoRequestPayload,
  DemoRequestResponse,
  LoginPayload,
  LoginResponse,
  DashboardSummaryResponse,
  DashboardPipelineResponse,
  DashboardAgentsResponse,
  DashboardCandidatesResponse,
} from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeoutMs = 8000, headers = {}, ...rest } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }
      throw new ApiError(
        res.status,
        `Request to ${endpoint} failed with status ${res.status}`,
        errorBody
      );
    }

    return (await res.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms`);
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

export async function submitDemoRequest(
  payload: DemoRequestPayload
): Promise<DemoRequestResponse> {
  return apiFetch<DemoRequestResponse>("/api/demo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(
  payload: LoginPayload
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  return apiFetch<DashboardSummaryResponse>("/api/dashboard/summary");
}

export async function fetchDashboardPipeline(): Promise<DashboardPipelineResponse> {
  return apiFetch<DashboardPipelineResponse>("/api/dashboard/pipeline");
}

export async function fetchDashboardAgents(): Promise<DashboardAgentsResponse> {
  return apiFetch<DashboardAgentsResponse>("/api/dashboard/agents");
}

export async function fetchDashboardCandidates(
  limit: number = 4
): Promise<DashboardCandidatesResponse> {
  return apiFetch<DashboardCandidatesResponse>(
    `/api/dashboard/candidates?limit=${limit}`
  );
}

