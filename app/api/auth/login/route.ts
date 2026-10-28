import { NextRequest, NextResponse } from "next/server";
import { LoginFormSchema } from "@/lib/validators";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = LoginFormSchema.safeParse(json);

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
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
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

    // Mock response fallback
    return NextResponse.json({
      status: "success",
      token: "mock-jwt-token-stap-demo",
      message: "Logged in successfully (mock fallback)",
      user: {
        id: "usr_12345",
        email: parsed.data.email,
        name: "Recruiter Admin",
      },
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

