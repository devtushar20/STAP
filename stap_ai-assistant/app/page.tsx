"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AgentStep {
  name: string;
  role: string;
  status: "idle" | "running" | "done" | "blocked";
}

interface AnalysisResult {
  candidateName: string;
  overallScore: number;
  screeningScore: number;
  recommendation: string;
  experienceYears: number;
  education: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  questions: {
    category: string;
    question: string;
    whatToLookFor: string;
  }[];
}

interface PipelineResponse {
  candidate_name: string;
  overall_score: number;
  screening_score: number;
  recommendation: string;
  experience_years: number;
  education: string;
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  questions: {
    category: string;
    question: string;
    what_to_look_for: string;
  }[];
  agents: {
    name: string;
    role: string;
    status: "done" | "blocked";
  }[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

function isPipelineResponse(value: unknown): value is PipelineResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  const isStringArray = (items: unknown): items is string[] =>
    Array.isArray(items) && items.every((item) => typeof item === "string");
  const isQuestionArray = (
    items: unknown
  ): items is PipelineResponse["questions"] =>
    Array.isArray(items) &&
    items.every(
      (question) =>
        typeof question === "object" &&
        question !== null &&
        "category" in question &&
        typeof question.category === "string" &&
        "question" in question &&
        typeof question.question === "string" &&
        "what_to_look_for" in question &&
        typeof question.what_to_look_for === "string"
    );

  return (
    typeof response.candidate_name === "string" &&
    typeof response.overall_score === "number" &&
    typeof response.screening_score === "number" &&
    typeof response.recommendation === "string" &&
    typeof response.experience_years === "number" &&
    typeof response.education === "string" &&
    isStringArray(response.matching_skills) &&
    isStringArray(response.missing_skills) &&
    isStringArray(response.strengths) &&
    isStringArray(response.weaknesses) &&
    isQuestionArray(response.questions) &&
    Array.isArray(response.agents) &&
    response.agents.length === 6 &&
    response.agents.every(
      (agent) =>
        typeof agent === "object" &&
        agent !== null &&
        "name" in agent &&
        typeof agent.name === "string" &&
        "role" in agent &&
        typeof agent.role === "string" &&
        "status" in agent &&
        (agent.status === "done" || agent.status === "blocked")
    )
  );
}

const SAMPLE_JOB_ROLE = "Senior Full-Stack Engineer";
const SAMPLE_REQUIRED_SKILLS = "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, AWS, Docker, System Design";
const SAMPLE_RESUME = `Aarav Mehta
Email: aarav.mehta@example.com | Phone: +1 (555) 019-2834 | San Francisco, CA
LinkedIn: linkedin.com/in/aaravmehta | GitHub: github.com/aaravmehta

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 7+ years of experience building scalable distributed web applications, cloud-native microservices, and high-performance React/Next.js platforms. Led engineering teams across series A-C startups.

TECHNICAL SKILLS
- Frontend: TypeScript, JavaScript, React.js, Next.js (App Router), Tailwind CSS, Redux Toolkit, WebSockets
- Backend & APIs: Node.js, Express, Python (FastAPI, Django), REST, GraphQL, gRPC
- Databases: PostgreSQL, Redis, DynamoDB, Prisma ORM
- Cloud & DevOps: AWS (ECS, Lambda, S3, CloudFront), Docker, Kubernetes, CI/CD GitHub Actions
- Architecture: Microservices, Distributed Systems, Event-Driven Architecture, Caching

WORK EXPERIENCE
Lead Software Engineer | CloudScale Labs (2022 - Present)
- Architected and delivered customer-facing analytics dashboard serving 150K DAU using Next.js, TypeScript, and FastAPI.
- Reduced API response latency by 42% through Redis caching and PostgreSQL query optimization.
- Mentored 6 mid/junior engineers and established automated CI/CD pipelines reducing deployment failure rate by 80%.

Senior Full-Stack Developer | Nexus Dynamics (2019 - 2022)
- Built enterprise recruitment management platform using React, Node.js, and AWS ECS.
- Designed real-time candidate notification pipeline using WebSockets and Redis pub/sub.
- Integrated Greenhouse and Ashby ATS APIs for bidirectional candidate synchronization.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2015 - 2019)`;

export default function Home() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "chat">("pipeline");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Form State
  const [jobRole, setJobRole] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [resumeText, setResumeText] = useState("");

  // Pipeline State
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([
    { name: "Sourcing", role: "Resume Parser & Semantic Embedder", status: "idle" },
    { name: "Screening", role: "Job-Candidate Matcher", status: "idle" },
    { name: "Interview", role: "Adaptive Question Generator", status: "idle" },
    { name: "Evaluation", role: "Scorecard Synthesizer", status: "idle" },
    { name: "Scheduling", role: "Calendar Coordinator", status: "idle" },
    { name: "Compliance", role: "Fair Hiring & Bias Guard", status: "idle" },
  ]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let currentTheme: "light" | "dark" = media.matches ? "dark" : "light";
    try {
      const saved = localStorage.getItem("stap-theme");
      if (saved === "dark" || saved === "light") {
        currentTheme = saved;
      }
    } catch {
      // The system preference remains available when storage is disabled.
    }

    const applyTheme = (nextTheme: "light" | "dark") => {
      setTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.documentElement.style.colorScheme = nextTheme;
    };

    applyTheme(currentTheme);
    const onSystemChange = () => {
      try {
        if (localStorage.getItem("stap-theme")) return;
      } catch {
        return;
      }
      applyTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("stap-theme", next);
    } catch {
      // ignore
    }
  };

  const handleLoadSample = () => {
    setJobRole(SAMPLE_JOB_ROLE);
    setRequiredSkills(SAMPLE_REQUIRED_SKILLS);
    setResumeText(SAMPLE_RESUME);
    setResult(null);
    setErrorMessage("");
  };

  const handleRunPipeline = async () => {
    if (!jobRole.trim() || !resumeText.trim()) {
      setResult(null);
      setErrorMessage("Enter a target job role and candidate resume before running the pipeline.");
      return;
    }

    setIsRunning(true);
    setResult(null);
    setErrorMessage("");
    setPipelineSteps((steps) => steps.map((step) => ({ ...step, status: "idle" })));

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobRole, requiredSkills, resumeText }),
      });
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("The scoring backend returned an invalid response.");
      }

      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : typeof payload === "object" &&
                payload !== null &&
                "detail" in payload &&
                typeof payload.detail === "string"
              ? payload.detail
              : "The candidate pipeline could not complete.";
        throw new Error(message);
      }

      if (!isPipelineResponse(payload)) {
        throw new Error("The scoring backend returned an incomplete or invalid result.");
      }

      setResult({
        candidateName: payload.candidate_name,
        overallScore: payload.overall_score,
        screeningScore: payload.screening_score,
        recommendation: payload.recommendation,
        experienceYears: payload.experience_years,
        education: payload.education,
        matchingSkills: payload.matching_skills,
        missingSkills: payload.missing_skills,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        questions: payload.questions.map((question) => ({
          category: question.category,
          question: question.question,
          whatToLookFor: question.what_to_look_for,
        })),
      });
      setPipelineSteps(
        payload.agents.map((agent) => ({
          name: agent.name,
          role: agent.role,
          status: agent.status,
        }))
      );
    } catch (error) {
      setPipelineSteps((steps) =>
        steps.map((step) => ({ ...step, status: "idle" }))
      );
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while contacting the scoring backend."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const prompt = chatInput.trim();
    setChatInput("");
    setIsAiThinking(true);

    await new Promise((r) => setTimeout(r, 900));

    let aiReply = "";
    if (/interview|question/i.test(prompt)) {
      aiReply = `Here are 4 structured interview questions tailored for your request:

1. **System Design:** "How would you design an asynchronous resume ingestion service handling thousands of daily uploads with zero data loss?"
2. **Technical Deep-Dive:** "What are the tradeoffs between Server Components and Client Components in Next.js when optimizing First Contentful Paint?"
3. **Problem-Solving:** "Describe an instance where a production database query became a bottleneck. How did you diagnose and remediate it?"
4. **Cultural/Behavioral:** "How do you approach code reviews when mentoring junior engineers to balance rigorous quality with constructive feedback?"`;
    } else if (/reject|feedback|email/i.test(prompt)) {
      aiReply = `Here is a respectful, constructive candidate email draft:

Subject: Update regarding your application for [Role] at [Company]

Dear [Candidate Name],

Thank you for taking the time to meet with our team. We were genuinely impressed by your achievements and background.

After careful evaluation across our current requirements, we have decided to move forward with another candidate whose immediate experience aligns more specifically with our distributed microservices needs.

We truly appreciate your time and enthusiasm, and we will keep your profile in our talent network for future opportunities. We wish you continued success in your search!

Sincerely,
The Hiring Team`;
    } else if (/bias|fair/i.test(prompt)) {
      aiReply = `### Bias & Fairness Evaluation:
- **Language Checks:** Avoid gender-coded superlatives (e.g., "rockstar", "ninja", "dominant") that reduce diverse applicant rates by up to 34%.
- **Objective Rubrics:** Replace subjective criteria ("culture fit") with structured behavioral competencies ("values-aligned collaboration").
- **Blind Review:** Strip candidate names, graduation years, and physical addresses during initial screening to eliminate unconscious demographic bias.`;
    } else {
      aiReply = `I've analyzed your query regarding "${prompt}". In modern AI-augmented recruitment pipelines:
- **Candidate Evaluation:** Combine multi-modal skill verification with automated rubric scorecards to maintain consistent evaluation bars across interviewers.
- **Agent Workflows:** STAP's 6 specialized agents automate sourcing, resume verification, and calendar booking so talent teams can focus 100% on high-touch candidate relationships.`;
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsAiThinking(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Site Header */}
      <header className="site-header">
        <div className="nav-container">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" className="logo" aria-label="STAP home">
              <i></i>STAP
            </Link>
            <span className="badge green">AI Assistant</span>
          </div>

          <div className="assistant-nav-actions">
            <button
              className={`tab-pill ${activeTab === "pipeline" ? "active" : ""}`}
              onClick={() => setActiveTab("pipeline")}
              type="button"
            >
              Candidate Pipeline
            </button>
            <Link className="back-home" href="/">Back to home</Link>
            <button
              className="tg"
              onClick={toggleTheme}
              type="button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, padding: "36px 0 60px" }}>
        <div className="wrap">
          {activeTab === "pipeline" ? (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <div className="tag">Recruitment Intelligence Engine</div>
                <h1 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", marginBottom: "8px" }}>
                  Candidate Scoring & <span className="g">Multi-Agent Review</span>
                </h1>
                <p style={{ color: "var(--mute)", fontSize: "14px", maxWidth: "600px" }}>
                  Submit a job specification and candidate resume for review by six agents:
                  Sourcing, Screening, Interview, Evaluation, Scheduling, and Compliance.
                </p>
              </div>

              {/* Input Configuration Card */}
              <div className="card" style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 className="px" style={{ fontSize: "18px" }}>
                    1. Input Candidate & Role Specifications
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleLoadSample}
                  >
                    ⚡ Load Sample Role & Resume
                  </button>
                </div>

                <div className="assistant-form-grid">
                  <div>
                    <label className="input-label">Target Job Role *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Required Skills (Comma-separated)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. TypeScript, React, Next.js, Node.js, AWS"
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label className="input-label">Candidate Resume (Plain Text) *</label>
                  <textarea
                    className="input-field"
                    rows={6}
                    placeholder="Paste resume content or summary here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn green"
                  style={{ width: "100%", padding: "12px 20px", fontSize: "14px" }}
                  onClick={handleRunPipeline}
                  disabled={isRunning}
                  aria-busy={isRunning}
                >
                  {isRunning ? "Contacting scoring backend..." : "⚡ Run AI Agents Pipeline"}
                </button>
              </div>

              {errorMessage && (
                <div className="card pipeline-message error-message" role="alert">
                  <strong>Pipeline unavailable</strong>
                  <p>{errorMessage}</p>
                </div>
              )}
              {!isRunning && !result && !errorMessage && (
                <div className="card pipeline-message" role="status">
                  Add a role and resume, then run the pipeline to see results from the scoring
                  backend. No sample results are generated in the browser.
                </div>
              )}
              {isRunning && (
                <div className="card pipeline-message" role="status" aria-live="polite">
                  Sending the candidate and role details to the scoring backend. This can take
                  several seconds.
                </div>
              )}

              {/* Sequential Agent Pipeline Visualizer */}
              {(isRunning || result) && (
                <div style={{ marginBottom: "28px" }}>
                  <div className="tag">Real-Time Agent Execution Pipeline</div>
                  <div className="pipeline-track">
                    {pipelineSteps.map((step, idx) => (
                      <div
                        key={step.name}
                        className={`agent-node ${step.status === "running" ? "active" : step.status === "done" ? "done" : step.status === "blocked" ? "blocked" : ""}`}
                      >
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--mute)", marginBottom: "4px" }}>
                          AGENT 0{idx + 1}
                        </div>
                        <b style={{ display: "block", fontSize: "13.5px", marginBottom: "2px" }}>
                          {step.name}
                        </b>
                        <p style={{ fontSize: "11px", color: "var(--mute)", marginBottom: "8px" }}>
                          {step.role}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className={`badge ${step.status === "done" ? "green" : step.status === "running" ? "pink" : ""}`}
                            style={{ fontSize: "9px" }}
                          >
                            {step.status === "running"
                              ? "Processing..."
                              : step.status === "done"
                                ? "Complete"
                                : step.status === "blocked"
                                  ? "Needs review"
                                  : "Queued"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Result Output */}
              {result && (
                <div className="assistant-result-grid">
                  {/* Left Column: Scorecard & Gaps */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Score Summary Card */}
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div>
                          <div className="tag" style={{ marginBottom: "6px" }}>Evaluation Verdict</div>
                          <h3 className="px" style={{ fontSize: "22px" }}>
                            {result.candidateName}
                          </h3>
                          <div style={{ fontSize: "12px", color: "var(--mute)" }}>
                            {result.education} • {result.experienceYears}+ years experience
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--font-pixelify)", fontSize: "36px", color: "var(--g)" }}>
                            {result.overallScore}%
                          </div>
                          <span className="badge green">
                            {result.recommendation}
                          </span>
                        </div>
                      </div>

                      {/* Key Breakdown Stats */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "8px",
                          borderTop: "1px solid var(--line)",
                          paddingTop: "12px",
                          textAlign: "center",
                        }}
                      >
                        <div>
                          <small style={{ display: "block", fontSize: "10.5px", color: "var(--mute)" }}>
                            Screening score
                          </small>
                          <b style={{ fontSize: "14px" }}>{result.screeningScore}%</b>
                        </div>
                        <div>
                          <small style={{ display: "block", fontSize: "10.5px", color: "var(--mute)" }}>
                            Skills Matched
                          </small>
                          <b style={{ fontSize: "14px" }}>
                            {result.matchingSkills.length}/{result.matchingSkills.length + result.missingSkills.length}
                          </b>
                        </div>
                        <div>
                          <small style={{ display: "block", fontSize: "10.5px", color: "var(--mute)" }}>
                            Recommendation
                          </small>
                          <b style={{ fontSize: "14px", color: "var(--onink)" }}>
                            {result.recommendation}
                          </b>
                        </div>
                      </div>
                    </div>

                    {/* Skill Breakdown Card */}
                    <div className="card">
                      <h4 className="px" style={{ fontSize: "16px", marginBottom: "12px" }}>
                        Skill Alignment Matrix
                      </h4>

                      <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--onink)", marginBottom: "4px" }}>
                          ✔ Verified Matching Skills ({result.matchingSkills.length}):
                        </div>
                        <div>
                          {result.matchingSkills.map((skill) => (
                            <span key={skill} className="chip match">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {result.missingSkills.length > 0 && (
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--p)", marginBottom: "4px" }}>
                            ⚠ Missing / Desired Skills to Probe ({result.missingSkills.length}):
                          </div>
                          <div>
                            {result.missingSkills.map((skill) => (
                              <span key={skill} className="chip missing">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="card">
                      <h4 className="px" style={{ fontSize: "16px", marginBottom: "12px" }}>
                        Candidate Strengths & Areas to Probe
                      </h4>
                      <div style={{ marginBottom: "12px" }}>
                        <b style={{ fontSize: "12.5px", color: "var(--onink)" }}>Key Strengths:</b>
                        <ul style={{ paddingLeft: "18px", fontSize: "12.5px", marginTop: "4px" }}>
                          {result.strengths.map((s, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <b style={{ fontSize: "12.5px", color: "var(--p)" }}>Areas to Investigate:</b>
                        <ul style={{ paddingLeft: "18px", fontSize: "12.5px", marginTop: "4px" }}>
                          {result.weaknesses.map((w, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Questions & Email */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Interview Questions Card */}
                    <div className="card">
                      <h4 className="px" style={{ fontSize: "16px", marginBottom: "12px" }}>
                        Generated Adaptive Interview Questions
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {result.questions.map((q, idx) => (
                          <div
                            key={idx}
                            style={{
                              border: "1px solid var(--line)",
                              borderRadius: "6px",
                              padding: "12px",
                              background: "var(--bg)",
                            }}
                          >
                            <span className="badge green" style={{ fontSize: "9.5px", marginBottom: "6px" }}>
                              {q.category}
                            </span>
                            <div style={{ fontSize: "13px", fontWeight: 600, margin: "4px 0 6px" }}>
                              &ldquo;{q.question}&rdquo;
                            </div>
                            <div style={{ fontSize: "11.5px", color: "var(--mute)" }}>
                              <b>What to look for:</b> {q.whatToLookFor}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Interactive Recruiter Chat */
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ marginBottom: "20px" }}>
                <div className="tag">Interactive Hiring Copilot</div>
                <h1 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", marginBottom: "8px" }}>
                  Recruitment <span className="g">AI Assistant</span>
                </h1>
                <p style={{ color: "var(--mute)", fontSize: "13.5px" }}>
                  Ask questions, review job descriptions for bias, draft candidate communications,
                  or design interview rubrics in real-time.
                </p>
              </div>

              {/* Chat Thread */}
              <div
                className="card"
                style={{
                  minHeight: "440px",
                  maxHeight: "560px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginBottom: "16px",
                  padding: "20px",
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1.5px solid var(--ink)",
                      background: m.sender === "user" ? "var(--ink)" : "var(--card)",
                      color: m.sender === "user" ? "var(--bg)" : "var(--ink)",
                      boxShadow: "2px 2px 0 var(--ink)",
                      fontSize: "13.5px",
                      whiteSpace: "pre-line",
                    }}
                  >
                    <div>{m.text}</div>
                    <div
                      style={{
                        fontSize: "10px",
                        marginTop: "4px",
                        textAlign: "right",
                        color: m.sender === "user" ? "var(--mute)" : "var(--mute)",
                      }}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      background: "var(--card)",
                      border: "1px solid var(--line)",
                      fontSize: "12px",
                      color: "var(--mute)",
                      fontStyle: "italic",
                    }}
                  >
                    STAP AI is thinking...
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  "Generate 5 interview questions for a Senior Backend Engineer",
                  "Draft a polite candidate rejection email with constructive feedback",
                  "Review this job description for unconscious bias",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="btn btn-sm"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => setChatInput(prompt)}
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type a message or recruitment request..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                />
                <button
                  type="button"
                  className="btn dark"
                  onClick={handleSendChat}
                  disabled={isAiThinking}
                  style={{ minWidth: "90px" }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          padding: "18px 0",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--mute)",
        }}
      >
        © 2026 STAP AI Assistant. Human judgement + AI intelligence.
      </footer>
    </div>
  );
}
