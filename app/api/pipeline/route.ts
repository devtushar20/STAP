import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/proxy";

const MAX_RESUME_LENGTH = 50_000;

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("jobRole" in payload) ||
    typeof payload.jobRole !== "string" ||
    payload.jobRole.trim().length < 2 ||
    payload.jobRole.length > 255 ||
    !("requiredSkills" in payload) ||
    typeof payload.requiredSkills !== "string" ||
    payload.requiredSkills.length > 4_000 ||
    !("resumeText" in payload) ||
    typeof payload.resumeText !== "string" ||
    payload.resumeText.trim().length < 20 ||
    payload.resumeText.length > MAX_RESUME_LENGTH
  ) {
    return NextResponse.json(
      {
        message:
          "Enter a job role, required skills (up to 4,000 characters), and a resume of 20 to 50,000 characters.",
      },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_role: payload.jobRole.trim(),
        required_skills: payload.requiredSkills.trim(),
        resume_text: payload.resumeText.trim(),
      }),
      signal: AbortSignal.timeout(60_000),
    });

    const responseText = await response.text();
    let responseBody: unknown;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      return NextResponse.json(
        { message: "The scoring backend returned an invalid response." },
        { status: 502 }
      );
    }

    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return NextResponse.json(
      {
        message: timedOut
          ? "The scoring backend took too long to respond. Please try again."
          : "The scoring backend is unavailable. Make sure the backend is running and BACKEND_URL is configured.",
      },
      { status: timedOut ? 504 : 503 }
    );
  }
}
