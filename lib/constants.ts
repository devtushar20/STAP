import {
  ProblemItem,
  PipelineStep,
  SolutionStep,
  AgentItem,
  PricingTier,
  DashboardSummaryResponse,
  DashboardPipelineResponse,
  DashboardAgentsResponse,
  DashboardCandidatesResponse,
} from "./types";

export const SITE_METADATA = {
  title: "STAP – AI Recruitment Platform",
  description: "Six specialized AI agents. One intelligent platform for modern hiring.",
  url: "https://stap.ai",
  ogImage: "/assets/hero.webp",
};

export const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#agents", label: "AI Agents" },
  { href: "#pipeline", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
];

export const TRUST_BRANDS = [
  "Google",
  "Microsoft",
  "Spotify",
  "Notion",
  "Slack",
];

export const PROBLEMS_DATA: ProblemItem[] = [
  {
    id: "too-many-resumes",
    title: "Too many resumes",
    description: "Difficult to find relevant candidates",
    icon: "/assets/problem-resumes.png",
    width: 79,
    height: 71,
  },
  {
    id: "unstructured-interviews",
    title: "Unstructured interviews",
    description: "Inconsistent and biased evaluations",
    icon: "/assets/problem-interviews.png",
    width: 97,
    height: 69,
  },
  {
    id: "manual-evaluation",
    title: "Manual evaluation",
    description: "Time-consuming and error-prone",
    icon: "/assets/problem-evaluation.png",
    width: 68,
    height: 74,
  },
  {
    id: "back-and-forth-scheduling",
    title: "Back-and-forth scheduling",
    description: "Delays and poor candidate experience",
    icon: "/assets/problem-scheduling.png",
    width: 71,
    height: 68,
  },
];

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    step: "01",
    title: "Candidate",
    description: "Candidate enters the talent pool",
    icon: "/assets/pipe-01-candidate.png",
    width: 40,
    height: 45,
  },
  {
    step: "02",
    title: "Source",
    description: "Discover and structure profiles",
    icon: "/assets/pipe-02-source.png",
    width: 43,
    height: 46,
  },
  {
    step: "03",
    title: "Screen",
    description: "Match against job requirements",
    icon: "/assets/pipe-03-screen.png",
    width: 38,
    height: 48,
  },
  {
    step: "04",
    title: "Interview",
    description: "Conduct adaptive AI interviews",
    icon: "/assets/pipe-04-interview.png",
    width: 43,
    height: 39,
  },
  {
    step: "05",
    title: "Evaluate",
    description: "Convert to scorecards",
    icon: "/assets/pipe-05-evaluate.png",
    width: 49,
    height: 47,
  },
  {
    step: "06",
    title: "Schedule",
    description: "Coordinate next steps",
    icon: "/assets/pipe-06-schedule.png",
    width: 48,
    height: 46,
  },
  {
    step: "07",
    title: "Human Review",
    description: "Recruiter makes the final decision",
    icon: "/assets/pipe-07-human-review.png",
    width: 53,
    height: 54,
  },
];

export const SOLUTION_STEPS: SolutionStep[] = [
  {
    step: "01",
    title: "Source",
    description: "Discover and structure top talent",
    icon: "/assets/sol-01-source.png",
    width: 56,
    height: 61,
  },
  {
    step: "02",
    title: "Screen",
    description: "Analyze resumes and match skills",
    icon: "/assets/sol-02-screen.png",
    width: 56,
    height: 61,
  },
  {
    step: "03",
    title: "Interview",
    description: "Conduct adaptive AI interviews",
    icon: "/assets/sol-03-interview.png",
    width: 66,
    height: 60,
  },
  {
    step: "04",
    title: "Evaluate",
    description: "Generate scorecards and insights",
    icon: "/assets/sol-04-evaluate.png",
    width: 61,
    height: 60,
  },
  {
    step: "05",
    title: "Schedule",
    description: "Coordinate interviews and follow-ups",
    icon: "/assets/sol-05-schedule.png",
    width: 59,
    height: 59,
  },
  {
    step: "06",
    title: "Human Review",
    description: "Recruiter makes the final decision",
    icon: "/assets/sol-06-compliance.png",
    width: 63,
    height: 62,
  },
];

export const AGENTS_DATA: AgentItem[] = [
  {
    id: "L1",
    name: "Sourcing Agent",
    role: "Sourcing",
    description: "Discovers and structures candidate profiles",
    icon: "/assets/agent-sourcing.png",
    width: 53,
    height: 50,
  },
  {
    id: "L2",
    name: "Screening Agent",
    role: "Screening",
    description: "Matches candidates with job requirements",
    icon: "/assets/agent-screening.png",
    width: 52,
    height: 50,
  },
  {
    id: "L3",
    name: "Interview Agent",
    role: "Interview",
    description: "Conducts structured AI interviews",
    icon: "/assets/agent-interview.png",
    width: 52,
    height: 51,
  },
  {
    id: "R1",
    name: "Evaluation Agent",
    role: "Evaluation",
    description: "Generates scorecards and insights",
    icon: "/assets/agent-evaluation.png",
    width: 52,
    height: 50,
  },
  {
    id: "R2",
    name: "Scheduling Agent",
    role: "Scheduling",
    description: "Coordinates interviews and calendars",
    icon: "/assets/agent-scheduling.png",
    width: 52,
    height: 51,
  },
  {
    id: "R3",
    name: "Compliance Agent",
    role: "Compliance",
    description: "Ensures fair and compliant hiring processes",
    icon: "/assets/agent-compliance.png",
    width: 52,
    height: 51,
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    tierNumber: "TIER 01",
    name: "Starter",
    price: "$499",
    period: " /mo",
    description: "For startups and early teams making 1–3 critical hires per month.",
    features: [
      "2 Autonomous AI Agents",
      "Up to 100 candidate screenings",
      "Adaptive AI interviews",
      "Standard candidate scorecards",
    ],
    buttonText: "Start with Starter",
    buttonVariant: "outline",
    actionType: "demo",
  },
  {
    id: "growth",
    tierNumber: "TIER 02",
    name: "Growth",
    price: "$1,299",
    period: " /mo",
    description: "For growing companies hiring across multiple open technical and business roles.",
    features: [
      "All 6 Specialized AI Agents",
      "Unlimited sourcing & screening",
      "Multi-modal interview synthesis",
      "Automated calendar scheduling",
      "Greenhouse, Lever & Ashby integrations",
    ],
    buttonText: "Choose Growth",
    buttonVariant: "dark",
    isPopular: true,
    actionType: "demo",
  },
  {
    id: "enterprise",
    tierNumber: "TIER 03",
    name: "Enterprise",
    price: "Custom",
    description: "Tailored AI hiring pipelines, strict compliance policies, and bespoke ATS setups.",
    features: [
      "Custom agent workflows & rubrics",
      "Dedicated Compliance & Bias Agent",
      "SOC2 Type II, GDPR & ISO compliance",
      "Dedicated recruitment strategist",
      "99.9% uptime SLA",
    ],
    buttonText: "Talk to Sales",
    buttonVariant: "outline",
    actionType: "sales",
  },
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummaryResponse = {
  jobs: 12,
  candidates: 248,
  shortlisted: 42,
  interviews: 18,
};

export const MOCK_DASHBOARD_PIPELINE: DashboardPipelineResponse = {
  applied: 73,
  screening: 39,
  interview: 22,
  evaluation: 14,
  offer: 6,
  percentages: {
    applied: 30,
    screening: 16,
    interview: 12,
  },
};

export const MOCK_DASHBOARD_AGENTS: DashboardAgentsResponse = {
  agents: [
    { name: "Sourcing Agent", status: "● Active", statusType: "active" },
    { name: "Screening Agent", status: "● Processing", statusType: "processing" },
    { name: "Interview Agent", status: "● 3 today", statusType: "completed" },
    { name: "Evaluation Agent", status: "● 18 analyzed", statusType: "completed" },
  ],
};

export const MOCK_DASHBOARD_CANDIDATES: DashboardCandidatesResponse = {
  candidates: [
    { id: "1", name: "Aarav Mehta", role: "Senior Frontend Engineer", matchPercentage: 94 },
    { id: "2", name: "Priya Sharma", role: "Product Designer", matchPercentage: 91 },
    { id: "3", name: "Rohan Patel", role: "Backend Engineer", matchPercentage: 88 },
    { id: "4", name: "Sneha Iyer", role: "AI Research Scientist", matchPercentage: 86 },
  ],
};

