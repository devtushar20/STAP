import { NextResponse } from "next/server";
import { MOCK_DASHBOARD_SUMMARY } from "@/lib/constants";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/dashboard/summary`, {
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

  return NextResponse.json(MOCK_DASHBOARD_SUMMARY);
}

