import { NextRequest, NextResponse } from "next/server";
import { DemoFormSchema } from "@/lib/validators";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = DemoFormSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${BACKEND_URL}/demo-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not running: fallback to mock response
    }

    return NextResponse.json({
      status: "success",
      message: "Demo request received successfully (mock fallback)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

