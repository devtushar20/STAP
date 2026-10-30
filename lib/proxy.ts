import { NextRequest, NextResponse } from "next/server";

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export const FALLBACK_HEADER = "X-Stap-Fallback";

export function jsonWithFallback<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { [FALLBACK_HEADER]: "1" },
  });
}

export function authHeadersFrom(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const auth = req.headers.get("authorization");
  if (auth) {
    headers.Authorization = auth;
  }
  return headers;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  timeoutMs = 4000
): Promise<{ unreachable: boolean; response?: Response }> {
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { unreachable: false, response };
  } catch {
    return { unreachable: true };
  }
}

export async function proxyGet<T>(
  req: NextRequest,
  path: string,
  fallback: T
): Promise<NextResponse> {
  const { unreachable, response } = await backendFetch(
    path,
    { method: "GET", headers: authHeadersFrom(req) },
    3000
  );

  if (unreachable || !response) {
    return jsonWithFallback(fallback);
  }

  if (response.status === 401) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (response.ok) {
    const data = await response.json();
    return NextResponse.json(data);
  }

  if (response.status >= 500) {
    return jsonWithFallback(fallback);
  }

  return jsonWithFallback(fallback);
}
