import { NextRequest, NextResponse } from "next/server";
import { MOCK_DASHBOARD_CANDIDATES } from "@/lib/constants";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "4", 10);

  try {
    const res = await fetch(`${BACKEND_URL}/dashboard/candidates?limit=${limit}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline: return mock fallback
  }

  const sliced = {
    candidates: MOCK_DASHBOARD_CANDIDATES.candidates.slice(0, limit),
  };

  return NextResponse.json(sliced);
}

