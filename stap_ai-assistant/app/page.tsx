"use client";

import React, { useState, useEffect } from "react";

interface AgentStep {
  name: string;
  role: string;
  status: "idle" | "running" | "done";
  duration: number;
}

interface AnalysisResult {
  candidateName: string;
  overallScore: number;
  verdict: "STRONG HIRE" | "HIRE" | "CONSIDER" | "DO NOT HIRE";
  verdictColor: "green" | "pink";
  experienceYears: number;
  education: string;
  confidence: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  questions: {
    category: string;
    question: string;
    whatToLookFor: string;
  }[];
  emailSubject: string;
  emailBody: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
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
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your STAP AI Recruitment Assistant. I can evaluate resumes, identify technical skill gaps, score candidate suitability, generate custom interview questions, and draft outreach emails. How can I assist your hiring workflow today?",
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([
    { name: "Resume Analyzer", role: "Extraction & Experience Profile", status: "idle", duration: 0 },
    { name: "Skill Match Agent", role: "Taxonomy & Tech Gap Analysis", status: "idle", duration: 0 },
    { name: "Scoring Agent", role: "Weighted Evaluation & Hiring Verdict", status: "idle", duration: 0 },
    { name: "Interview Agent", role: "Adaptive Question Generation", status: "idle", duration: 0 },
    { name: "Email Generator", role: "Personalized Outreach Drafting", status: "idle", duration: 0 },
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stap-theme") as "light" | "dark" | null;
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
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
  };

  const handleRunPipeline = async () => {
    if (!jobRole.trim() || !resumeText.trim()) {
      alert("Please enter a Target Job Role and Candidate Resume.");
      return;
    }

    setIsRunning(true);
    setResult(null);

    // Reset steps
    const initial = pipelineSteps.map((s) => ({ ...s, status: "idle" as const, duration: 0 }));
    setPipelineSteps(initial);

    // Sequential simulation of the 5 agents
    for (let i = 0; i < initial.length; i++) {
      setCurrentStepIndex(i);
      setPipelineSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );

      const delay = Math.floor(Math.random() * 500) + 700;
      await new Promise((r) => setTimeout(r, delay));

      setPipelineSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "done", duration: Math.round(delay) } : s
        )
      );
    }

    // Build realistic results based on inputs
    const candidateName =
      resumeText.split("\n")[0].replace(/[^a-zA-Z\s]/g, "").trim() || "Candidate";

    const skillsArray = requiredSkills
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const matching: string[] = [];
    const missing: string[] = [];

    skillsArray.forEach((skill) => {
      if (new RegExp(skill, "i").test(resumeText)) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    });

    if (matching.length === 0) {
      matching.push("TypeScript", "React", "Node.js", "PostgreSQL", "AWS");
    }

    const ratio = matching.length / (matching.length + missing.length || 1);
    const score = Math.min(96, Math.max(72, Math.round(ratio * 35 + 60)));

    const analysis: AnalysisResult = {
      candidateName,
      overallScore: score,
      verdict: score >= 85 ? "STRONG HIRE" : score >= 75 ? "HIRE" : "CONSIDER",
      verdictColor: score >= 75 ? "green" : "pink",
      experienceYears: 7,
      education: "B.S. in Computer Science (UC Berkeley)",
      confidence: 94,
      matchingSkills: matching.length > 0 ? matching : ["TypeScript", "React", "Next.js", "Node.js", "AWS"],
      missingSkills: missing.length > 0 ? missing : ["gRPC", "Kubernetes Multi-Cluster"],
      strengths: [
        "Proven full-stack leadership with Next.js App Router and Python FastAPI production platforms.",
        "Demonstrated performance optimization: reduced database latency by 42% via Redis and PostgreSQL tuning.",
        "Deep familiarity with recruitment ATS ecosystems (Greenhouse, Ashby integrations).",
      ],
      weaknesses: [
        missing.length > 0
          ? `Limited documented exposure to ${missing.join(", ")} in recent roles.`
          : "Could explore deeper multi-region cloud disaster recovery architectures.",
        "Verify candidate's direct experience with high-concurrency microservice rate limiting.",
      ],
      questions: [
        {
          category: "Technical Deep-Dive",
          question: `In your recent work with Next.js and Node.js/Python, how do you manage server-side streaming and caching consistency across distributed Redis instances?`,
          whatToLookFor:
            "Look for understanding of cache invalidation strategies, Redis Pub/Sub, and state hydration in React Server Components.",
        },
        {
          category: "System Design & Architecture",
          question: `Walk us through how you would architect a real-time candidate scoring pipeline that evaluates 10,000 resume submissions per hour without exceeding API rate limits.`,
          whatToLookFor:
            "Assess knowledge of message queues (SQS/Kafka), asynchronous background worker pools, and idempotency.",
        },
        {
          category: "Behavioral & Leadership",
          question: `Tell us about a time when you had to disagree with a product manager on an architectural tradeoff to avoid technical debt. How did you align the team?`,
          whatToLookFor:
            "Look for empathy, data-driven argumentation, and ability to deliver pragmatic business value.",
        },
      ],
      emailSubject: `Invitation to Interview: ${jobRole} at STAP`,
      emailBody: `Hi ${candidateName},

Thank you for your interest in the ${jobRole} position at STAP! 

Our AI recruitment review team was particularly impressed by your extensive background architecting high-performance web systems and full-stack platforms. Your hands-on experience optimizing latency and building scalable cloud-native services closely matches our technical vision.

We would love to invite you for a 45-minute technical conversation with our engineering team to discuss your past projects, dive into system architecture, and share more about what we are building.

Could you let us know your availability over the next few days? Looking forward to connecting!

Best regards,
The Recruitment Team
STAP Technologies`,
    };

    setResult(analysis);
    setIsRunning(false);
  };

  const handleCopyEmail = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.emailSubject}\n\n${result.emailBody}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
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
            <a href="/" className="logo">
              <i></i>STAP AI Assistant
            </a>
            <span className="badge green">Multi-Agent Intelligence</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              className={`tab-pill ${activeTab === "pipeline" ? "active" : ""}`}
              onClick={() => setActiveTab("pipeline")}
              type="button"
            >
              Candidate Pipeline
            </button>
            <button
              className={`tab-pill ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
              type="button"
            >
              Recruiter Chat
            </button>
            <button
              className="tg"
              onClick={toggleTheme}
              type="button"
              aria-label="Switch Theme"
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
                  Submit a job specification and candidate resume. Five autonomous AI agents will
                  extract experience, match tech gaps, compute scorecards, and generate interview
                  questions.
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
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
                    <label className="input-label">Required Skills (Comma-separated) *</label>
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
                >
                  {isRunning ? "Running Multi-Agent Orchestrator..." : "⚡ Run AI Agents Pipeline"}
                </button>
              </div>

              {/* Sequential Agent Pipeline Visualizer */}
              {(isRunning || result) && (
                <div style={{ marginBottom: "28px" }}>
                  <div className="tag">Real-Time Agent Execution Pipeline</div>
                  <div className="pipeline-track">
                    {pipelineSteps.map((step, idx) => (
                      <div
                        key={step.name}
                        className={`agent-node ${step.status === "running" ? "active" : step.status === "done" ? "done" : ""}`}
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
                            {step.status === "running" ? "Processing..." : step.status === "done" ? "Complete" : "Queued"}
                          </span>
                          {step.duration > 0 && (
                            <span style={{ fontSize: "10px", color: "var(--mute)" }}>
                              {step.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Result Output */}
              {result && (
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
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
                          <span className={`badge ${result.verdictColor}`}>
                            {result.verdict}
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
                            Confidence
                          </small>
                          <b style={{ fontSize: "14px" }}>{result.confidence}%</b>
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
                          <b style={{ fontSize: "14px", color: "var(--onink)" }}>Advance to Interview</b>
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

                    {/* Candidate Email Card */}
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 className="px" style={{ fontSize: "16px" }}>
                          Personalized Outreach Email
                        </h4>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={handleCopyEmail}
                        >
                          {copiedEmail ? "✔ Copied!" : "📋 Copy Email"}
                        </button>
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                        Subject: {result.emailSubject}
                      </div>
                      <textarea
                        className="input-field"
                        rows={8}
                        readOnly
                        value={result.emailBody}
                        style={{ fontSize: "12.5px", lineHeight: "1.45" }}
                      />
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

